import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.core.database import get_database
from app.services.apriori_engine import apriori_engine
from app.api import categories, places, recommendations, discover, search

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(name)s: %(message)s")
logger = logging.getLogger(__name__)

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    logger.info("Starting Bengaluru Smart City Discovery API...")
    db = get_database()
    logger.info("Training initial Apriori association engine...")
    apriori_engine.train()
    logger.info("Apriori association engine trained successfully with %d rules.", len(apriori_engine.rules_cache))
    yield
    # Shutdown
    logger.info("Shutting down Bengaluru Smart City Discovery API.")

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="Intelligent Smart City Discovery & Apriori Recommendation Platform for Bengaluru, Karnataka, India.",
    version="1.0.0",
    lifespan=lifespan
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Health endpoint
@app.get("/api/health")
def health_check():
    db = get_database()
    return {
        "status": "online",
        "city": "Bengaluru, Karnataka, India",
        "service": settings.PROJECT_NAME,
        "database_connected": db.is_connected,
        "apriori_engine": {
            "status": "trained" if apriori_engine.is_trained else "not_trained",
            "rules_count": len(apriori_engine.rules_cache),
            "itemsets_count": len(apriori_engine.itemsets_cache),
            "min_support": apriori_engine.min_support,
            "min_confidence": apriori_engine.min_confidence,
            "min_lift": apriori_engine.min_lift
        }
    }

# Include API Routers
app.include_router(categories.router, prefix="/api", tags=["Categories"])
app.include_router(places.router, prefix="/api", tags=["Places"])
app.include_router(recommendations.router, prefix="/api", tags=["Recommendations"])
app.include_router(discover.router, prefix="/api", tags=["Discover & Analytics"])
app.include_router(search.router, prefix="/api", tags=["Search"])

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
