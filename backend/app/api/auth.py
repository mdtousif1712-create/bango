import logging
import os
import time
from typing import Optional, List
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import requests
from app.core.database import get_database

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/auth")

class GoogleAuthRequest(BaseModel):
    credential: Optional[str] = None
    access_token: Optional[str] = None

class SyncSavedRequest(BaseModel):
    email: str
    saved_place_ids: List[str]

@router.post("/google")
def google_auth(payload: GoogleAuthRequest):
    """
    Authenticate a user via Google Sign-In.
    Verifies Google ID token (JWT) or OAuth2 access token directly with Google's servers,
    upserts user in MongoDB, and returns user session.
    """
    user_info = {}
    
    # 1. If a Google JWT ID credential is provided, verify via Google's tokeninfo endpoint
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

    # 2. If a Google OAuth2 access token is provided, verify via Google's userinfo endpoint
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

    else:
        raise HTTPException(status_code=400, detail="Missing Google credential or access token.")

    if not user_info.get("email"):
        raise HTTPException(status_code=400, detail="No email address associated with this Google account.")

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
