import logging
from typing import Dict, Any, Optional
from app.utils.query_parser import parse_natural_query
from app.services.location_service import location_service
from app.services.recommendation_service import recommendation_service

logger = logging.getLogger(__name__)

class SearchService:
    def process_query(self, query: str, user_lat: Optional[float] = None, user_lng: Optional[float] = None) -> Dict[str, Any]:
        parsed = parse_natural_query(query)
        domain = parsed.get("domain")
        locality = parsed.get("locality")
        intent = parsed.get("intent")

        # 1. Search matching places directly
        matched_places = location_service.get_places(
            category=domain,
            locality=locality,
            search_query=query if not domain and not locality else None,
            lat=user_lat,
            lng=user_lng,
            limit=20
        )

        # 2. Extract potential place/activity entity from query for Apriori mining
        all_places = location_service.get_all_places()
        identified_place = None
        for p in all_places:
            if p["name"].lower() in query.lower():
                identified_place = p
                break

        # 3. Query Apriori engine
        apriori_results = []
        has_rules = False
        notice = None

        if identified_place:
            rec_data = recommendation_service.get_recommendations_for_place(
                identified_place["place_id"],
                user_lat=user_lat,
                user_lng=user_lng
            )
            apriori_results = rec_data.get("recommendations", [])
            has_rules = rec_data.get("has_association_rules", False)
            notice = rec_data.get("notice")
        elif domain:
            rec_data = recommendation_service.search_recommendations(
                category=domain,
                locality=locality,
                user_lat=user_lat,
                user_lng=user_lng
            )
            apriori_results = rec_data.get("recommendations", [])
            has_rules = rec_data.get("has_association_rules", False)
            notice = rec_data.get("notice")
        else:
            notice = "No specific smart city domain or place entity identified in query. Showing standard text matches."

        # Filter out non-association fallback from apriori_results to keep association rules pure
        pure_apriori = [r for r in apriori_results if r.get("recommendation_type") == "association"]

        explanation_parts = []
        if domain:
            explanation_parts.append(f"Domain: {domain}")
        if locality:
            explanation_parts.append(f"Locality: {locality}")
        if identified_place:
            explanation_parts.append(f"Entity: {identified_place['name']}")
        explanation_str = " | ".join(explanation_parts) if explanation_parts else "General Search Query"

        return {
            "query": query,
            "parsed_domain": domain,
            "parsed_locality": locality,
            "parsed_intent": intent,
            "matched_places": matched_places,
            "apriori_recommendations": pure_apriori,
            "has_rules": len(pure_apriori) > 0,
            "explanation": f"Parsed query ({explanation_str}). {len(matched_places)} places found in Bengaluru.",
            "notice": notice if len(pure_apriori) == 0 else None
        }

search_service = SearchService()
