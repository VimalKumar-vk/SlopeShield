from fastapi import APIRouter
from app.config import settings

router = APIRouter()

@router.get("/health")
def health():
    return {
        "status": "healthy",
        "service": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "environment": "development"
    }
