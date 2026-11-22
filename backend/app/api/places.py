from fastapi import APIRouter, HTTPException, Query
from typing import Optional, List
from app.services.location_service import location_service
from app.models.place import PlaceBase

router = APIRouter()

@router.get("/places")
def get_places(
    category: Optional[str] = Query(None, description="Domain category e.g. Tourism, Restaurants"),
    locality: Optional[str] = Query(None, description="Bengaluru locality e.g. Indiranagar, Whitefield"),
    search: Optional[str] = Query(None, description="Free text search query"),
    latitude: Optional[float] = Query(None, description="User latitude for distance calculation"),
    longitude: Optional[float] = Query(None, description="User longitude for distance calculation"),
    radius_km: Optional[float] = Query(None, description="Radius limit in km"),
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100)
):
    results = location_service.get_places(
        category=category,
        locality=locality,
        search_query=search,
        lat=latitude,
        lng=longitude,
        radius_km=radius_km,
        skip=skip,
        limit=limit
    )
    return {
        "places": results,
        "count": len(results),
        "skip": skip,
        "limit": limit
    }

@router.get("/places/{place_id}")
def get_place_details(place_id: str):
    place = location_service.get_place_by_id(place_id)
    if not place:
        raise HTTPException(status_code=404, detail="Place not found")
    return place
