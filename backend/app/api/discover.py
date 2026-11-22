from fastapi import APIRouter, Query, Body
from typing import Optional, Dict, Any
from app.services.trending_service import trending_service
from app.services.location_service import location_service
from app.services.apriori_engine import apriori_engine

router = APIRouter()

@router.get("/trending")
def get_trending(
    category: Optional[str] = Query(None, description="Domain category e.g. Tourism, Restaurants"),
    limit: int = Query(10, ge=1, le=50)
):
    trending_places = trending_service.get_trending_places(category=category, limit=limit)
    return {
        "trending": trending_places,
        "count": len(trending_places),
        "category_filter": category or "All"
    }

@router.get("/analytics/summary")
def get_analytics_summary():
    places = location_service.get_all_places()
    rules = apriori_engine.get_all_rules(limit=500)
    itemsets = apriori_engine.get_all_itemsets(limit=500)
    
    # Category distribution
    cat_counts = {}
    for p in places:
        c = p.get("category", "Other")
        cat_counts[c] = cat_counts.get(c, 0) + 1
        
    avg_conf = 0.0
    if rules:
        avg_conf = sum(r["confidence"] for r in rules) / len(rules)

    return {
        "total_places": len(places),
        "total_transactions": apriori_engine.total_transactions_count,
        "total_rules_generated": len(rules),
        "frequent_itemsets_count": len(itemsets),
        "average_confidence": round(avg_conf, 3),
        "parameters": {
            "min_support": apriori_engine.min_support,
            "min_confidence": apriori_engine.min_confidence,
            "min_lift": apriori_engine.min_lift
        },
        "category_breakdown": [{"category": k, "count": v} for k, v in cat_counts.items()],
        "dataset_source": "Bengaluru Smart City Mobility & Activity Seed (1,250 Synthetic Citizen Journeys)"
    }

@router.get("/algorithm/rules")
def get_association_rules(
    limit: int = Query(100, ge=1, le=500),
    min_confidence: Optional[float] = Query(None),
    min_lift: Optional[float] = Query(None)
):
    all_rules = apriori_engine.get_all_rules(limit=limit)
    filtered = all_rules
    if min_confidence is not None:
        filtered = [r for r in filtered if r["confidence"] >= min_confidence]
    if min_lift is not None:
        filtered = [r for r in filtered if r["lift"] >= min_lift]
        
    return {
        "rules": filtered[:limit],
        "total_rules": len(filtered),
        "parameters": {
            "min_support": apriori_engine.min_support,
            "min_confidence": apriori_engine.min_confidence,
            "min_lift": apriori_engine.min_lift
        }
    }

@router.get("/algorithm/itemsets")
def get_frequent_itemsets(limit: int = Query(100, ge=1, le=500)):
    itemsets = apriori_engine.get_all_itemsets(limit=limit)
    return {
        "itemsets": itemsets,
        "total_itemsets": len(itemsets),
        "min_support": apriori_engine.min_support
    }

@router.post("/algorithm/retrain")
def retrain_algorithm(payload: Dict[str, Any] = Body(...)):
    min_support = payload.get("min_support", 0.02)
    min_confidence = payload.get("min_confidence", 0.30)
    min_lift = payload.get("min_lift", 1.0)
    
    apriori_engine.train(
        min_support=float(min_support),
        min_confidence=float(min_confidence),
        min_lift=float(min_lift)
    )
    
    return {
        "message": "Apriori model retrained successfully",
        "rules_generated": len(apriori_engine.rules_cache),
        "itemsets_generated": len(apriori_engine.itemsets_cache),
        "min_support": apriori_engine.min_support,
        "min_confidence": apriori_engine.min_confidence,
        "min_lift": apriori_engine.min_lift
    }
