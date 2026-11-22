import logging
from pymongo import MongoClient
from app.core.config import settings

logger = logging.getLogger(__name__)

class Database:
    client: MongoClient = None
    db = None
    is_connected: bool = False

    def connect(self):
        try:
            self.client = MongoClient(settings.MONGODB_URL, serverSelectionTimeoutMS=2500)
            # Test connection
            self.client.admin.command('ping')
            self.db = self.client[settings.DATABASE_NAME]
            self.is_connected = True
            logger.info("Successfully connected to MongoDB at %s", settings.MONGODB_URL)
        except Exception as e:
            logger.warning("MongoDB connection failed (%s). Utilizing in-memory/disk store fallback.", str(e))
            self.is_connected = False
            self.db = None

    def get_collection(self, name: str):
        if self.is_connected and self.db is not None:
            return self.db[name]
        return None

db_instance = Database()

def get_database():
    if not db_instance.is_connected:
        db_instance.connect()
    return db_instance
