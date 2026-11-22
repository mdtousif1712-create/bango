from typing import List, Optional
from datetime import datetime
from pydantic import BaseModel, Field

class Transaction(BaseModel):
    transaction_id: str
    items: List[str]
    category: Optional[str] = None
    locality: Optional[str] = None
    source: str = "smart_city_mobility_seed"
    created_at: datetime = Field(default_factory=datetime.utcnow)
