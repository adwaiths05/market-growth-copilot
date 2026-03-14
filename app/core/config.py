# app/core/config.py
from pydantic_settings import BaseSettings, SettingsConfigDict
from functools import lru_cache

class Settings(BaseSettings):
    DATABASE_URL: str
    TAVILY_API_KEY: str
    MISTRAL_API_KEY: str
    REDIS_URL: str = "redis://localhost:6379/0"
    
    # --- NEW API KEYS ---
    SERPAPI_API_KEY: str = ""
    FIRECRAWL_API_KEY: str = ""
    DEMO_MODE: bool = False
    SECRET_KEY: str = "" 
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30

    WORKER_CONCURRENCY: int = 4
    CELERY_TASK_TRACK_STARTED: bool = True
    CELERY_TASK_TIME_LIMIT: int = 600
    APP_NAME: str = "Marketplace Growth Copilot"
    DEBUG: bool = False

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

@lru_cache()
def get_settings():
    return Settings()

settings = get_settings()