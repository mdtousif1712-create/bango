from typing import List, Optional
from pydantic import BaseModel, Field

class PlaceBase(BaseModel):
    place_id: str
    name: str
    category: str
    subcategory: Optional[str] = None
    description: str
    address: str
    locality: str
    latitude: float
    longitude: float
    image_url: str
    rating: Optional[float] = 4.5
    review_count: Optional[int] = 120
    tags: List[str] = Field(default_factory=list)
    popular_activity: Optional[str] = None

class Place(PlaceBase):
    pass

class PlaceFilter(BaseModel):
    category: Optional[str] = None
    locality: Optional[str] = None
    search_query: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    radius_km: Optional[float] = None
    skip: int = 0
    limit: int = 50
