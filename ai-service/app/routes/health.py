from fastapi import APIRouter
from app.config import settings

router = APIRouter()

@router.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "service": "Factory Safety AI Service",
        "version": "1.0.0",
        "simulation_mode": settings.SIMULATION_MODE,
        "detectors": ["ppe", "fire", "smoke"],
        "models_loaded": True
    }
