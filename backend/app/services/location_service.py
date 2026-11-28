import os
import json
import math
import logging
from typing import List, Optional, Dict, Any
from app.core.database import get_database
from app.models.place import PlaceBase

logger = logging.getLogger(__name__)

def haversine_distance(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """Calculates distance between two lat/lng coordinates in km using Haversine formula."""
    R = 6371.0  # Earth's radius in kilometers
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    a = math.sin(dlat / 2)**2 + math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(dlon / 2)**2
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return round(R * c, 2)

class LocationService:
    def __init__(self):
        self._fallback_places: List[Dict[str, Any]] = []
        self._load_fallback_places()

    def _load_fallback_places(self):
        try:
            json_path = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "data", "places.json")
            if os.path.exists(json_path):
                with open(json_path, "r", encoding="utf-8") as f:
                    self._fallback_places = json.load(f)
        except Exception as e:
            logger.error(f"Error loading fallback places: {e}")

    def get_all_places(self) -> List[Dict[str, Any]]:
        db = get_database()
        if db.is_connected:
            col = db.get_collection("places")
            if col is not None:
                docs = list(col.find({}, {"_id": 0}))
                if docs:
                    return docs
        return self._fallback_places

    def get_places(
        self,
        category: Optional[str] = None,
        locality: Optional[str] = None,
        search_query: Optional[str] = None,
        lat: Optional[float] = None,
        lng: Optional[float] = None,
        radius_km: Optional[float] = None,
        skip: int = 0,
        limit: int = 100
    ) -> List[Dict[str, Any]]:
        places = self.get_all_places()
        filtered = []

        for p in places:
            # Filter by Category
            if category and category.lower() != "all" and p.get("category", "").lower() != category.lower():
                continue

            # Filter by Locality
            if locality and locality.lower() not in p.get("locality", "").lower() and locality.lower() not in p.get("address", "").lower():
                continue

            # Filter by Search Query
            if search_query:
                sq = search_query.lower()
                name_match = sq in p.get("name", "").lower()
                desc_match = sq in p.get("description", "").lower()
                tag_match = any(sq in t.lower() for t in p.get("tags", []))
                loc_match = sq in p.get("locality", "").lower() or sq in p.get("address", "").lower()
                if not (name_match or desc_match or tag_match or loc_match):
                    continue

            # Distance calculation & filtering
            if lat is not None and lng is not None:
                dist = haversine_distance(lat, lng, p["latitude"], p["longitude"])
                p = dict(p)
                p["distance_km"] = dist
                if radius_km and dist > radius_km:
                    continue
            filtered.append(p)

        # Sort by distance if location provided, else by rating
        if lat is not None and lng is not None:
            filtered.sort(key=lambda x: x.get("distance_km", 99999))
        else:
            filtered.sort(key=lambda x: x.get("rating", 0), reverse=True)

        return filtered[skip: skip + limit]

    def get_place_by_id(self, place_id: str) -> Optional[Dict[str, Any]]:
        places = self.get_all_places()
        for p in places:
            if p.get("place_id") == place_id:
                return p
        return None

    def find_place_by_name(self, name: str) -> Optional[Dict[str, Any]]:
        places = self.get_all_places()
        name_lower = name.strip().lower()
        # Exact match first
        for p in places:
            if p.get("name", "").lower() == name_lower:
                return p
        # Substring match
        for p in places:
            if name_lower in p.get("name", "").lower() or p.get("name", "").lower() in name_lower:
                return p
        return None

location_service = LocationService()
