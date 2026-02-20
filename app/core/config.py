from pydantic_settings import BaseSettings, SettingsConfigDict
from functools import lru_cache

class Settings(BaseSettings):
    DATABASE_URL: str
    TAVILY_API_KEY: str
    MISTRAL_API_KEY: str
    REDIS_URL: str = "redis://localhost:6379/0"
    WORKER_CONCURRENCY: int = 4
    APP_NAME: str = "Marketplace Growth Copilot"
    DEBUG: bool = False

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

@lru_cache()
def get_settings():
    """Returns a cached instance of settings to avoid re-reading the .env file."""
    return Settings()

settings = get_settings()