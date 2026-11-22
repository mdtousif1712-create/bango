from typing import List, Optional, Any, Dict
from datetime import datetime
from pydantic import BaseModel, Field
from app.models.place import PlaceBase

class AssociationRuleModel(BaseModel):
    rule_id: str
    antecedents: List[str]
    consequents: List[str]
    support: float
    confidence: float
    lift: float
    explanation: str
    generated_at: datetime = Field(default_factory=datetime.utcnow)

class RecommendationItem(BaseModel):
    place: PlaceBase
    confidence: float
    lift: float
    support: float
    antecedent: str
    rule_explanation: str
    recommendation_type: str = "association"  # association, proximity, trending, category_fallback
    distance_km: Optional[float] = None

class RecommendationResponse(BaseModel):
    query_item: Optional[str] = None
    category: Optional[str] = None
    recommendations: List[RecommendationItem] = Field(default_factory=list)
    total: int = 0
    rules_applied_count: int = 0
    has_association_rules: bool = True
    notice: Optional[str] = None

class SearchQueryRequest(BaseModel):
    query: str
    user_lat: Optional[float] = None
    user_lng: Optional[float] = None

class SearchQueryResult(BaseModel):
    query: str
    parsed_domain: Optional[str] = None
    parsed_location: Optional[str] = None
    parsed_intent: Optional[str] = None
    matched_places: List[PlaceBase] = Field(default_factory=list)
    apriori_recommendations: List[RecommendationItem] = Field(default_factory=list)
    has_rules: bool = True
    explanation: str

class AnalyticsSummary(BaseModel):
    total_places: int
    total_transactions: int
    total_rules_generated: int
    top_categories: List[Dict[str, Any]]
    frequent_itemsets_count: int
    average_confidence: float
    dataset_source: str = "Bengaluru Smart City Mobility & Activity Seed (Synthetic Demonstration Data)"
