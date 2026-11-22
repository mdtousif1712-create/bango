import os
import json
import logging
from typing import List, Dict, Any, Optional
import pandas as pd
from mlxtend.frequent_patterns import apriori, association_rules
from app.core.config import settings
from app.core.database import get_database
from app.utils.preprocessing import clean_and_encode_transactions

logger = logging.getLogger(__name__)

class AprioriEngine:
    def __init__(self):
        self.min_support = settings.DEFAULT_MIN_SUPPORT
        self.min_confidence = settings.DEFAULT_MIN_CONFIDENCE
        self.min_lift = settings.DEFAULT_MIN_LIFT
        
        self.frequent_itemsets: pd.DataFrame = pd.DataFrame()
        self.rules: pd.DataFrame = pd.DataFrame()
        self.rules_cache: List[Dict[str, Any]] = []
        self.itemsets_cache: List[Dict[str, Any]] = []
        self.is_trained: bool = False
        self.total_transactions_count: int = 0

    def load_transactions(self) -> List[List[str]]:
        """Loads transaction data from MongoDB or CSV fallback."""
        db = get_database()
        transactions: List[List[str]] = []
        
        if db.is_connected:
            col = db.get_collection("transactions")
            if col is not None:
                cursor = col.find({}, {"items": 1, "_id": 0})
                for doc in cursor:
                    if "items" in doc and isinstance(doc["items"], list):
                        transactions.append(doc["items"])
        
        if not transactions:
            data_path = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "data", "transactions.csv")
            if os.path.exists(data_path):
                df = pd.read_csv(data_path)
                for acts in df["activities"]:
                    if isinstance(acts, str):
                        items = [x.strip() for x in acts.split(",") if x.strip()]
                        transactions.append(items)
            else:
                json_path = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "data", "transactions.json")
                if os.path.exists(json_path):
                    with open(json_path, "r", encoding="utf-8") as f:
                        data = json.load(f)
                        for d in data:
                            transactions.append(d["items"])
                            
        self.total_transactions_count = len(transactions)
        logger.info(f"Loaded {len(transactions)} transactions for Apriori mining.")
        return transactions

    def train(self, min_support: Optional[float] = None, min_confidence: Optional[float] = None, min_lift: Optional[float] = None):
        """
        Executes Steps 1 to 8:
        1. Load transactions
        2. Clean & Preprocess
        3. One-hot encoding
        4. Apriori algorithm
        5. Frequent itemsets
        6. Association rules
        7. Compute Support, Confidence, Lift
        8. Store and cache rules
        """
        if min_support is not None:
            self.min_support = min_support
        if min_confidence is not None:
            self.min_confidence = min_confidence
        if min_lift is not None:
            self.min_lift = min_lift

        transactions = self.load_transactions()
        if not transactions:
            logger.warning("No transactions found to train Apriori model.")
            return

        # 3. One-hot encoding
        df_encoded, _ = clean_and_encode_transactions(transactions)
        
        # 4 & 5. Apriori Frequent Itemsets
        self.frequent_itemsets = apriori(df_encoded, min_support=self.min_support, use_colnames=True)
        
        # Format itemsets cache
        self.itemsets_cache = []
        for idx, row in self.frequent_itemsets.sort_values(by="support", ascending=False).iterrows():
            self.itemsets_cache.append({
                "itemset": list(row["itemsets"]),
                "support": round(float(row["support"]), 4),
                "item_count": len(row["itemsets"])
            })

        # 6 & 7. Generate Association Rules
        if not self.frequent_itemsets.empty:
            rules_df = association_rules(self.frequent_itemsets, metric="confidence", min_threshold=self.min_confidence)
            
            # Filter by minimum lift
            if not rules_df.empty and "lift" in rules_df.columns:
                rules_df = rules_df[rules_df["lift"] >= self.min_lift]
                
            self.rules = rules_df
            
            # Format rules cache
            self.rules_cache = []
            for idx, row in self.rules.sort_values(by=["confidence", "lift"], ascending=[False, False]).iterrows():
                antecedents = list(row["antecedents"])
                consequents = list(row["consequents"])
                conf = round(float(row["confidence"]), 4)
                lift = round(float(row["lift"]), 4)
                supp = round(float(row["support"]), 4)
                
                # Explanations
                ant_str = ", ".join(antecedents)
                con_str = ", ".join(consequents)
                explanation = (
                    f"Visitors who frequently engaged with {ant_str} also selected {con_str} "
                    f"in historical smart city mobility patterns (Confidence: {conf*100:.1f}%, Lift: {lift:.2f}x)."
                )
                
                rule_item = {
                    "rule_id": f"RULE_{idx+1:04d}",
                    "antecedents": antecedents,
                    "consequents": consequents,
                    "support": supp,
                    "confidence": conf,
                    "lift": lift,
                    "explanation": explanation
                }
                self.rules_cache.append(rule_item)
                
            # 8. Save to MongoDB if connected
            db = get_database()
            if db.is_connected:
                try:
                    col = db.get_collection("association_rules")
                    if col is not None:
                        col.delete_many({})
                        if self.rules_cache:
                            col.insert_many([dict(r) for r in self.rules_cache])
                            logger.info(f"Persisted {len(self.rules_cache)} association rules to MongoDB.")
                except Exception as e:
                    logger.warning(f"Failed to persist rules to MongoDB: {e}")
                    
        self.is_trained = True
        logger.info(f"Apriori model trained: {len(self.itemsets_cache)} frequent itemsets, {len(self.rules_cache)} rules generated.")

    def find_rules_for_item(self, item_name: str) -> List[Dict[str, Any]]:
        """
        Finds rules where the given item_name matches any antecedent (case-insensitive substring match).
        """
        if not self.is_trained:
            self.train()
            
        matches = []
        item_lower = item_name.strip().lower()
        
        for rule in self.rules_cache:
            for ant in rule["antecedents"]:
                # Check for direct or partial match
                if item_lower in ant.lower() or ant.lower() in item_lower:
                    matches.append(rule)
                    break
                    
        # Sort by confidence descending, then lift descending
        matches.sort(key=lambda r: (r["confidence"], r["lift"], r["support"]), reverse=True)
        return matches

    def get_all_rules(self, limit: int = 100) -> List[Dict[str, Any]]:
        if not self.is_trained:
            self.train()
        return self.rules_cache[:limit]

    def get_all_itemsets(self, limit: int = 100) -> List[Dict[str, Any]]:
        if not self.is_trained:
            self.train()
        return self.itemsets_cache[:limit]

apriori_engine = AprioriEngine()
