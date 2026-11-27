from fastapi import APIRouter
from typing import List, Dict, Any

router = APIRouter()

CATEGORIES_META: List[Dict[str, Any]] = [
    {
        "id": "all",
        "name": "All",
        "icon": "Compass",
        "color": "#5681EB",
        "markerColor": "#5681EB",
        "description": "Explore all verified smart city domains across Bengaluru."
    },
    {
        "id": "healthcare",
        "name": "Healthcare",
        "icon": "HeartPulse",
        "color": "#EF4444",
        "markerColor": "#EF4444",
        "description": "Multi-specialty hospitals, research institutes, trauma care, and diagnostic centers."
    },
    {
        "id": "transportation",
        "name": "Transportation",
        "icon": "Train",
        "color": "#3B82F6",
        "markerColor": "#3B82F6",
        "description": "Namma Metro stations, railway terminus hubs, and BMTC bus stations."
    },
    {
        "id": "tourism",
        "name": "Tourism",
        "icon": "Landmark",
        "color": "#10B981",
        "markerColor": "#10B981",
        "description": "Historic monuments, palaces, botanical gardens, and science museums."
    },
    {
        "id": "shopping",
        "name": "Shopping",
        "icon": "ShoppingBag",
        "color": "#F97316",
        "markerColor": "#F97316",
        "description": "Destination shopping malls, luxury complexes, and traditional bazaars."
    },
    {
        "id": "education",
        "name": "Education",
        "icon": "GraduationCap",
        "color": "#6366F1",
        "markerColor": "#6366F1",
        "description": "World-class universities, engineering colleges, and public reference libraries."
    },
    {
        "id": "entertainment",
        "name": "Entertainment",
        "icon": "Clapperboard",
        "color": "#8B5CF6",
        "markerColor": "#8B5CF6",
        "description": "IMAX cinemas, theatres, cultural halls, adventure arenas, and theme parks."
    },
    {
        "id": "restaurants",
        "name": "Restaurants",
        "icon": "Utensils",
        "color": "#F59E0B",
        "markerColor": "#F59E0B",
        "description": "Craft breweries, heritage South Indian tiffins, and diverse dining."
    },
    {
        "id": "startups",
        "name": "Startups",
        "icon": "Rocket",
        "color": "#06B6D4",
        "markerColor": "#06B6D4",
        "description": "Tech incubators, unicorn headquarters, co-working spaces, and innovation hubs across Silicon Valley of India."
    }
]

@router.get("/categories")
def get_categories():
    return {"categories": CATEGORIES_META}
