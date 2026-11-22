from fastapi import APIRouter, Query, Body
from typing import Optional, Dict, Any
from app.services.recommendation_service import recommendation_service

router = APIRouter()

@router.get("/recommendations/{place_id}")
def get_place_recommendations(
    place_id: str,
    latitude: Optional[float] = Query(None, description="User latitude"),
    longitude: Optional[float] = Query(None, description="User longitude")
):
    """
    Returns Apriori association rule-based recommendations for the selected place.
    """
    return recommendation_service.get_recommendations_for_place(
        place_id=place_id,
        user_lat=latitude,
        user_lng=longitude
    )

@router.post("/recommendations/search")
def search_recommendations_endpoint(payload: Dict[str, Any] = Body(...)):
    category = payload.get("category")
    activity = payload.get("activity")
    locality = payload.get("locality")
    lat = payload.get("latitude")
    lng = payload.get("longitude")
    
    return recommendation_service.search_recommendations(
        category=category,
        activity=activity,
        locality=locality,
        user_lat=lat,
        user_lng=lng
    )
