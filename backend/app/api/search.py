from fastapi import APIRouter
from app.models.recommendation import SearchQueryRequest
from app.services.search_service import search_service

router = APIRouter()

@router.post("/search")
def natural_language_search(request: SearchQueryRequest):
    return search_service.process_query(
        query=request.query,
        user_lat=request.user_lat,
        user_lng=request.user_lng
    )
