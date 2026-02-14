from pydantic_settings import BaseSettings, SettingsConfigDict
from functools import lru_cache

class Settings(BaseSettings):
    # Required Variables (App will fail to start if these are missing)
    DATABASE_URL: str
    TAVILY_API_KEY: str
    MISTRAL_API_KEY: str
    
    # Optional / Default Variables
    APP_NAME: str = "Marketplace Growth Copilot"
    DEBUG: bool = False

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

@lru_cache()
def get_settings():
    """Returns a cached instance of settings to avoid re-reading the .env file."""
    return Settings()

settings = get_settings()