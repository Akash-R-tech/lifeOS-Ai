from pydantic_settings import BaseSettings
from typing import Optional, List
import os

class Settings(BaseSettings):
    APP_NAME: str = "LifeOS AI"
    APP_ENV: str = "development"
    PORT: int = 8000
    HOST: str = "0.0.0.0"
    
    # AI Providers
    GEMINI_API_KEY: Optional[str] = None
    OPENAI_API_KEY: Optional[str] = None
    DEFAULT_AI_PROVIDER: str = "gemini"
    GEMINI_MODEL: str = "gemini-3.8-flash"
    
    # Database
    DATABASE_URL: str = "sqlite+aiosqlite:///./lifeos.db"
    REDIS_URL: str = "redis://localhost:6379/0"
    
    # Priority Engine Weights (Default: Urgency 0.35, Importance 0.30, Goal 0.20, Consequence 0.15)
    WEIGHT_URGENCY: float = 0.35
    WEIGHT_IMPORTANCE: float = 0.30
    WEIGHT_GOAL_RELEVANCE: float = 0.20
    WEIGHT_CONSEQUENCE: float = 0.15
    
    # Continuous Monitoring
    EVENT_MONITOR_INTERVAL_SECONDS: int = 15
    DEMO_MODE: bool = True
    
    # Voice Intimation
    VOICE_ENABLED: bool = True
    VOICE_LOCALE: str = "en-US"
    VOICE_TONE: str = "colloquial_partner"  # Friendly, concise, "Mapla..."
    
    class Config:
        env_file = ".env"
        extra = "ignore"

settings = Settings()
