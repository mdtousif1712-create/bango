import collections
from typing import List, Dict, Any, Optional
from app.services.location_service import location_service
from app.services.apriori_engine import apriori_engine

class TrendingService:
    def get_trending_places(self, category: Optional[str] = None, limit: int = 10) -> List[Dict[str, Any]]:
        """
        Calculates trending places from occurrence counts in the smart city transactions dataset,
        weighted by historical citizen visits.
        """
        # Ensure apriori has loaded transactions
        txns = apriori_engine.load_transactions()
        counter = collections.Counter()
        for txn in txns:
            for item in txn:
                counter[item] += 1
                
        all_places = location_service.get_all_places()
        scored_places = []
        
        for p in all_places:
            if category and category.lower() != "all" and p.get("category", "").lower() != category.lower():
                continue
                
            name = p.get("name", "")
            # Count how often this place or an activity matches in counter
            visits_in_dataset = counter.get(name, 0)
            # If not direct match, check partial
            if visits_in_dataset == 0:
                for item_name, count in counter.items():
                    if name.lower() in item_name.lower() or item_name.lower() in name.lower():
                        visits_in_dataset += count
                        
            # Real historical signal
            score = visits_in_dataset * 10 + (p.get("review_count", 0) / 1000.0)
            
            p_copy = dict(p)
            p_copy["dataset_visit_frequency"] = visits_in_dataset
            p_copy["popularity_metric"] = round(score, 1)
            scored_places.append(p_copy)
            
        scored_places.sort(key=lambda x: (x.get("dataset_visit_frequency", 0), x.get("rating", 0)), reverse=True)
        return scored_places[:limit]

trending_service = TrendingService()
