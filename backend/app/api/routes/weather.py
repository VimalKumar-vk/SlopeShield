from fastapi import APIRouter, HTTPException

from app.database.session import SessionLocal
from app.database.models import Location
from app.services.weather_service import collect_weather_for_location


router = APIRouter()


@router.get("/weather/{location_id}")
def get_location_weather(location_id: int):

    db = SessionLocal()

    try:
        location = (
            db.query(Location)
            .filter(Location.id == location_id)
            .first()
        )

        if not location:
            raise HTTPException(
                status_code=404,
                detail="Location not found",
            )

        environmental = collect_weather_for_location(
            location_id
        )

        return {
            "location_id": location.id,
            "location": location.name,
            "district": location.district,
            "state": location.state,
            "latitude": location.latitude,
            "longitude": location.longitude,
            "elevation": location.elevation,
            "rainfall_24h": environmental["rainfall_24h"],
            "rainfall_72h": environmental["rainfall_72h"],
            "soil_moisture": environmental["soil_moisture"],
        }

    finally:
        db.close()
        