import os
from pydantic_settings import BaseSettings
from pydantic import ConfigDict

class Settings(BaseSettings):
    PROJECT_NAME: str = "Bengaluru Smart City Discovery"
    API_V1_STR: str = "/api"
    MONGODB_URL: str = os.getenv("MONGODB_URL", "mongodb://127.0.0.1:27017")
    DATABASE_NAME: str = os.getenv("DATABASE_NAME", "bengaluru_smart_city")
    
    # Default Apriori parameters
    DEFAULT_MIN_SUPPORT: float = 0.02
    DEFAULT_MIN_CONFIDENCE: float = 0.30
    DEFAULT_MIN_LIFT: float = 1.0
    
    # Bengaluru boundary coordinates
    BENGALURU_CENTER_LAT: float = 12.9716
    BENGALURU_CENTER_LNG: float = 77.5946
    
    model_config = ConfigDict(
        env_file=".env",
        case_sensitive=True,
        extra="allow"
    )

settings = Settings()
