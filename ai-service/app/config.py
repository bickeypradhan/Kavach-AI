import os
from pydantic_settings import BaseSettings

class Settings:
    CONFIDENCE_THRESHOLD: float = float(os.getenv("CONFIDENCE_THRESHOLD", "0.45"))
    FIRE_CONFIDENCE_THRESHOLD: float = float(os.getenv("FIRE_CONFIDENCE_THRESHOLD", "0.55"))
    SMOKE_CONFIDENCE_THRESHOLD: float = float(os.getenv("SMOKE_CONFIDENCE_THRESHOLD", "0.45"))
    FRAME_SAMPLE_RATE: int = int(os.getenv("FRAME_SAMPLE_RATE", "5"))
    EVENT_COOLDOWN_SECONDS: int = int(os.getenv("EVENT_COOLDOWN_SECONDS", "20"))
    SIMULATION_MODE: bool = os.getenv("SIMULATION_MODE", "true").lower() in ("true", "1", "yes")
    MODEL_DIR: str = os.getenv("MODEL_DIR", "./models")

settings = Settings()
