import logging
import os
import re
import socket
import time
from typing import Optional, List
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import requests
from app.core.database import get_database

try:
    import dns.resolver
    HAS_DNS = True
except ImportError:
    HAS_DNS = False

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/auth")

EMAIL_REGEX = re.compile(
    r"^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$"
)

DISPOSABLE_DOMAINS = {
    "mailinator.com", "tempmail.com", "10minutemail.com", "guerrillamail.com",
    "yopmail.com", "trashmail.com", "sharklasers.com", "dispostable.com",
    "getairmail.com", "throwawaymail.com", "fakeinbox.com"
}

def is_legit_email(email: str) -> tuple[bool, str]:
    """
    Validates whether an email address is authentic and legit:
    1. Basic syntax and length checks
    2. Character and structure verification (RFC 5322 compliance)
    3. Blocklist check for temporary / disposable mail domains
    4. DNS MX record validation and host resolution check
    """
    if not email or not isinstance(email, str):
        return False, "Please enter an email address."
    
    clean = email.strip().lower()
    if len(clean) > 254:
        return False, "Email address is too long."
    
    if not EMAIL_REGEX.match(clean):
        return False, "Please enter a valid email format (e.g., yourname@gmail.com)."
    
    parts = clean.split("@")
    if len(parts) != 2:
        return False, "Email must contain exactly one '@' symbol."
    
    user_part, domain = parts[0], parts[1]
    
    if len(user_part) < 2:
        return False, "Email user name is too short (minimum 2 characters)."
    
    if ".." in clean:
        return False, "Email cannot contain consecutive dots."
    
    if domain in DISPOSABLE_DOMAINS:
        return False, "Disposable or temporary emails are not allowed. Please enter a real, permanent email."
    
    domain_parts = domain.split(".")
    if len(domain_parts) < 2 or len(domain_parts[-1]) < 2:
        return False, "Email domain must have a valid top-level extension (e.g. .com, .org, .in)."
    
    # Check if domain has active MX records or resolves as a host
    domain_valid = False
    if HAS_DNS:
        try:
            answers = dns.resolver.query(domain, "MX")
            if answers and len(answers) > 0:
                domain_valid = True
        except Exception:
            domain_valid = False
    
    if not domain_valid:
        try:
            socket.gethostbyname(domain)
            domain_valid = True
        except Exception:
            domain_valid = False
            
    if not domain_valid:
        return False, f"Domain '@{domain}' is unreachable or does not exist. Please enter a legit email address."
        
    return True, ""

class GoogleAuthRequest(BaseModel):
    credential: Optional[str] = None
    access_token: Optional[str] = None
    email: Optional[str] = None
    name: Optional[str] = None
    picture: Optional[str] = None

class SyncSavedRequest(BaseModel):
    email: str
    saved_place_ids: List[str]

@router.post("/google")
def google_auth(payload: GoogleAuthRequest):
    """
    Authenticate a user via Google Sign-In or verified email & username.
    - If Google token is provided, verifies with Google Identity Services.
    - If direct email is provided, verifies that the email is legit (RFC structure, real MX/host domain),
      allows any username chosen by the user, and persists session in MongoDB.
    """
    user_info = {}
    
    # 1. If Google JWT ID credential is provided, verify via Google tokeninfo
    if payload.credential:
        try:
            resp = requests.get(
                f"https://oauth2.googleapis.com/tokeninfo?id_token={payload.credential}",
                timeout=5.0
            )
            if resp.status_code == 200:
                data = resp.json()
                user_info = {
                    "google_id": data.get("sub"),
                    "email": data.get("email"),
                    "name": data.get("name", "Google Explorer"),
                    "picture": data.get("picture", ""),
                    "email_verified": data.get("email_verified", "true") == "true"
                }
                logger.info("Successfully verified Google ID token for email: %s", user_info["email"])
            else:
                logger.warning("Google tokeninfo returned status %s: %s", resp.status_code, resp.text)
                raise HTTPException(status_code=401, detail="Invalid Google ID token. Please sign in again.")
        except HTTPException:
            raise
        except Exception as e:
            logger.error("Error validating Google credential: %s", str(e))
            raise HTTPException(status_code=502, detail="Failed to connect to Google authentication service.")

    # 2. If Google OAuth2 access token is provided, verify via Google userinfo
    elif payload.access_token:
        try:
            resp = requests.get(
                "https://www.googleapis.com/oauth2/v3/userinfo",
                headers={"Authorization": f"Bearer {payload.access_token}"},
                timeout=5.0
            )
            if resp.status_code == 200:
                data = resp.json()
                user_info = {
                    "google_id": data.get("sub"),
                    "email": data.get("email"),
                    "name": data.get("name", "Google Explorer"),
                    "picture": data.get("picture", ""),
                    "email_verified": data.get("email_verified", True)
                }
                logger.info("Successfully verified Google access token for email: %s", user_info["email"])
            else:
                logger.warning("Google userinfo returned status %s: %s", resp.status_code, resp.text)
                raise HTTPException(status_code=401, detail="Invalid or expired Google access token.")
        except HTTPException:
            raise
        except Exception as e:
            logger.error("Error validating Google access token: %s", str(e))
            raise HTTPException(status_code=502, detail="Failed to connect to Google authentication service.")

    # 3. Direct Email + Custom Username Flow (with Legit Email Verification)
    elif payload.email:
        clean_email = payload.email.strip().lower()
        is_valid, reason = is_legit_email(clean_email)
        if not is_valid:
            raise HTTPException(status_code=400, detail=reason)
        
        # User can pick any display username they want
        raw_name = payload.name.strip() if payload.name and payload.name.strip() else clean_email.split("@")[0].replace(".", " ").title()
        display_name = raw_name if raw_name else "Bengaluru Explorer"
        avatar_url = payload.picture or f"https://api.dicebear.com/7.x/initials/svg?seed={display_name}&backgroundColor=191919&textColor=ffffff"

        user_info = {
            "google_id": f"usr_{abs(hash(clean_email))}",
            "email": clean_email,
            "name": display_name,
            "picture": avatar_url,
            "email_verified": True
        }
        logger.info("Legit email verified and user authenticated: %s (name: %s)", clean_email, display_name)

    else:
        raise HTTPException(status_code=400, detail="Please enter an email address to proceed.")

    if not user_info.get("email"):
        raise HTTPException(status_code=400, detail="No email address associated with this account.")

    # Upsert user record in MongoDB
    db = get_database()
    users_col = db.get_collection("users")
    saved_places = []
    
    if users_col is not None:
        try:
            existing = users_col.find_one({"email": user_info["email"]})
            if existing:
                saved_places = existing.get("saved_places", [])
                users_col.update_one(
                    {"email": user_info["email"]},
                    {"$set": {
                        "name": user_info["name"],
                        "picture": user_info.get("picture", ""),
                        "last_login": time.time()
                    }}
                )
            else:
                user_record = {
                    "google_id": user_info.get("google_id"),
                    "email": user_info["email"],
                    "name": user_info["name"],
                    "picture": user_info.get("picture", ""),
                    "created_at": time.time(),
                    "last_login": time.time(),
                    "saved_places": []
                }
                users_col.insert_one(user_record)
        except Exception as err:
            logger.error("Failed to persist user in MongoDB: %s", str(err))

    return {
        "success": True,
        "user": {
            "email": user_info["email"],
            "name": user_info["name"],
            "picture": user_info.get("picture", ""),
            "google_id": user_info.get("google_id"),
            "saved_places": saved_places
        },
        "token": f"bango_token_{int(time.time())}"
    }

@router.post("/sync-saved")
def sync_saved_places(payload: SyncSavedRequest):
    """
    Sync saved places for a signed-in user with MongoDB.
    """
    db = get_database()
    users_col = db.get_collection("users")
    if users_col is not None:
        try:
            users_col.update_one(
                {"email": payload.email},
                {"$set": {"saved_places": payload.saved_place_ids}}
            )
            return {"success": True, "saved_places": payload.saved_place_ids}
        except Exception as e:
            logger.error("Failed to sync saved places: %s", str(e))
    return {"success": True, "saved_places": payload.saved_place_ids}
