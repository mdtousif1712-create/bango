import logging
from typing import List, Dict, Any, Optional
from app.services.location_service import location_service, haversine_distance
from app.services.apriori_engine import apriori_engine

logger = logging.getLogger(__name__)

class RecommendationService:
    def get_recommendations_for_place(
        self,
        place_id: str,
        user_lat: Optional[float] = None,
        user_lng: Optional[float] = None
    ) -> Dict[str, Any]:
        """
        Retrieves association rule-based recommendations for a selected place.
        """
        place = location_service.get_place_by_id(place_id)
        if not place:
            return {
                "query_item": place_id,
                "category": None,
                "recommendations": [],
                "total": 0,
                "rules_applied_count": 0,
                "has_association_rules": False,
                "notice": f"Place with ID '{place_id}' not found."
            }

        place_name = place.get("name", "")
        place_category = place.get("category", "")
        
        # Query Apriori engine for rules matching this place name
        matching_rules = apriori_engine.find_rules_for_item(place_name)
        
        # If no direct place rules, also search for category rules
        if not matching_rules and place_category:
            matching_rules = apriori_engine.find_rules_for_item(place_category)

        recommendations = []
        seen_place_ids = {place.get("place_id")}

        for rule in matching_rules:
            consequents = rule.get("consequents", [])
            conf = rule.get("confidence", 0.0)
            lift = rule.get("lift", 1.0)
            supp = rule.get("support", 0.0)
            ant_str = ", ".join(rule.get("antecedents", []))

            for con in consequents:
                resolved_place = location_service.find_place_by_name(con)
                if resolved_place and resolved_place.get("place_id") not in seen_place_ids:
                    seen_place_ids.add(resolved_place.get("place_id"))
                    
                    dist = None
                    if user_lat is not None and user_lng is not None:
                        dist = haversine_distance(user_lat, user_lng, resolved_place["latitude"], resolved_place["longitude"])
                    elif place.get("latitude") and place.get("longitude"):
                        dist = haversine_distance(place["latitude"], place["longitude"], resolved_place["latitude"], resolved_place["longitude"])

                    p_clean = dict(resolved_place)
                    if dist is not None:
                        p_clean["distance_km"] = dist

                    rule_explanation = (
                        f"Frequently co-visited with {ant_str} in historical Bengaluru activity journeys "
                        f"(Confidence: {conf*100:.1f}%, Lift: {lift:.2f}x, Support: {supp*100:.1f}%)."
                    )

                    recommendations.append({
                        "place": p_clean,
                        "confidence": conf,
                        "lift": lift,
                        "support": supp,
                        "antecedent": ant_str,
                        "rule_explanation": rule_explanation,
                        "recommendation_type": "association",
                        "distance_km": dist
                    })

        # Rank recommendations using: 1. Confidence, 2. Lift, 3. Support, 4. Distance
        recommendations.sort(
            key=lambda r: (
                r["confidence"],
                r["lift"],
                r["support"],
                -r["distance_km"] if r.get("distance_km") is not None else 0
            ),
            reverse=True
        )

        has_rules = len(recommendations) > 0
        notice = None

        if not has_rules:
            notice = (
                f"Insufficient historical transaction patterns were found for '{place_name}' "
                f"at minimum support (0.02) and confidence (0.30). Showing popular locations across '{place_category}'."
            )
            # Graceful location-based fallback
            nearby_category = location_service.get_places(
                category=place_category,
                lat=place.get("latitude"),
                lng=place.get("longitude"),
                limit=5
            )
            for p in nearby_category:
                if p.get("place_id") not in seen_place_ids:
                    seen_place_ids.add(p.get("place_id"))
                    dist = haversine_distance(place["latitude"], place["longitude"], p["latitude"], p["longitude"])
                    p_clean = dict(p)
                    p_clean["distance_km"] = dist
                    recommendations.append({
                        "place": p_clean,
                        "confidence": 0.0,
                        "lift": 0.0,
                        "support": 0.0,
                        "antecedent": place_name,
                        "rule_explanation": f"Recommended because it is a top-rated verified destination in {place_category} ({dist:.1f} km away).",
                        "recommendation_type": "category_fallback",
                        "distance_km": dist
                    })

        return {
            "query_item": place_name,
            "category": place_category,
            "recommendations": recommendations,
            "total": len(recommendations),
            "rules_applied_count": len(matching_rules),
            "has_association_rules": has_rules,
            "notice": notice
        }

    def search_recommendations(
        self,
        category: Optional[str] = None,
        activity: Optional[str] = None,
        locality: Optional[str] = None,
        user_lat: Optional[float] = None,
        user_lng: Optional[float] = None
    ) -> Dict[str, Any]:
        """
        Accepts category, activity, location, and queries Apriori rules or places.
        """
        query_key = activity or category or locality or "Bengaluru"
        matching_rules = apriori_engine.find_rules_for_item(query_key)
        
        recommendations = []
        seen = set()

        for rule in matching_rules:
            consequents = rule.get("consequents", [])
            conf = rule.get("confidence", 0.0)
            lift = rule.get("lift", 1.0)
            supp = rule.get("support", 0.0)
            ant_str = ", ".join(rule.get("antecedents", []))

            for con in consequents:
                resolved = location_service.find_place_by_name(con)
                if resolved and resolved.get("place_id") not in seen:
                    # If category or locality filter provided, verify relevance
                    if category and category.lower() != "all" and resolved.get("category", "").lower() != category.lower():
                        continue
                    if locality and locality.lower() not in resolved.get("locality", "").lower() and locality.lower() not in resolved.get("address", "").lower():
                        continue

                    seen.add(resolved.get("place_id"))
                    dist = None
                    if user_lat is not None and user_lng is not None:
                        dist = haversine_distance(user_lat, user_lng, resolved["latitude"], resolved["longitude"])

                    p_clean = dict(resolved)
                    if dist is not None:
                        p_clean["distance_km"] = dist

                    rule_explanation = (
                        f"Strong activity association with {ant_str} "
                        f"(Confidence: {conf*100:.1f}%, Lift: {lift:.2f}x)."
                    )

                    recommendations.append({
                        "place": p_clean,
                        "confidence": conf,
                        "lift": lift,
                        "support": supp,
                        "antecedent": ant_str,
                        "rule_explanation": rule_explanation,
                        "recommendation_type": "association",
                        "distance_km": dist
                    })

        has_rules = len(recommendations) > 0
        notice = None if has_rules else "No historical association rules matched this criteria. Displaying verified local places."

        if not has_rules:
            # Fallback to direct place search
            direct_matches = location_service.get_places(category=category, locality=locality, lat=user_lat, lng=user_lng, limit=8)
            for p in direct_matches:
                if p.get("place_id") not in seen:
                    seen.add(p.get("place_id"))
                    dist = p.get("distance_km")
                    recommendations.append({
                        "place": p,
                        "confidence": 0.0,
                        "lift": 0.0,
                        "support": 0.0,
                        "antecedent": query_key,
                        "rule_explanation": f"Verified location matching {category or 'Bengaluru'} in {locality or 'the city'}.",
                        "recommendation_type": "location_fallback",
                        "distance_km": dist
                    })

        return {
            "query_item": query_key,
            "category": category,
            "recommendations": recommendations,
            "total": len(recommendations),
            "rules_applied_count": len(matching_rules),
            "has_association_rules": has_rules,
            "notice": notice
        }

recommendation_service = RecommendationService()
