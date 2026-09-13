from fastapi import APIRouter, Depends, HTTPException, status
from app.services import weather_service
from sqlalchemy.orm import Session
from app.services import risk_engine

from app.database.session import get_db
from app.schemas import (
    EnvironmentalReading,
    EnvironmentalReadingCreate,
    EnvironmentalReadingUpdate,
)
from app.services import environment_service


router = APIRouter()


@router.get("/readings", response_model=list[EnvironmentalReading])
def get_readings(db: Session = Depends(get_db)):
    return environment_service.get_readings(db)


@router.get(
    "/readings/{location_id}",
    response_model=list[EnvironmentalReading],
)
def get_location_readings(
    location_id: int,
    db: Session = Depends(get_db),
):
    return environment_service.get_location_readings(
        location_id,
        db,
    )


@router.get(
    "/readings/{location_id}/latest",
    response_model=EnvironmentalReading,
)
def get_latest_location_reading(
    location_id: int,
    db: Session = Depends(get_db),
):
    reading = environment_service.get_latest_location_reading(
        location_id,
        db,
    )

    if not reading:
        raise HTTPException(
            status_code=404,
            detail="Environmental reading not found",
        )

    return reading


@router.post(
    "/readings",
    response_model=EnvironmentalReading,
    status_code=status.HTTP_201_CREATED,
    responses={
        404: {
            "description": "Location not found"
        }
    },
)
def create_reading(
    reading: EnvironmentalReadingCreate,
    db: Session = Depends(get_db),
):
    return environment_service.create_reading(reading, db)


@router.put(
    "/readings/{reading_id}",
    response_model=EnvironmentalReading,
)
def update_reading(
    reading_id: int,
    reading_update: EnvironmentalReadingUpdate,
    db: Session = Depends(get_db),
):
    reading = environment_service.update_reading(
        reading_id,
        reading_update,
        db,
    )

    if not reading:
        raise HTTPException(
            status_code=404,
            detail="Environmental reading not found",
        )

    return reading


@router.delete("/readings/{reading_id}")
def delete_reading(
    reading_id: int,
    db: Session = Depends(get_db),
):
    deleted = environment_service.delete_reading(
        reading_id,
        db,
    )

    if not deleted:
        raise HTTPException(
            status_code=404,
            detail="Environmental reading not found",
        )

    return {
        "message": "Environmental reading deleted successfully"
    }
@router.get("/readings/{location_id}/live")
def get_live_environment_data(
    location_id: int,
    db: Session = Depends(get_db),
):
    """
    Fetch real-time environmental data
    for a monitored location.
    """

    # Temporary location lookup
    locations = {
        1: {
            "name": "Aizawl",
            "latitude": 23.7271,
            "longitude": 92.7176,
        },
        2: {
            "name": "Shillong",
            "latitude": 25.5788,
            "longitude": 91.8933,
        },
        3: {
            "name": "Kohima",
            "latitude": 25.6751,
            "longitude": 94.1086,
        },
    }

    location = locations.get(location_id)

    if not location:
        raise HTTPException(
            status_code=404,
            detail="Location not found",
        )

    try:
        weather_data = weather_service.get_live_weather(
            latitude=location["latitude"],
            longitude=location["longitude"],
        )

        current = weather_data["current"]

        return {
            "location": location["name"],
            "location_id": location_id,
            "latitude": location["latitude"],
            "longitude": location["longitude"],

            "temperature": current.get("temperature_2m"),
            "humidity": current.get(
                "relative_humidity_2m"
            ),
            "rain": current.get("rain"),
            "precipitation": current.get(
                "precipitation"
            ),
            "wind_speed": current.get(
                "wind_speed_10m"
            ),

            "source": "Live Weather API",
        }

    except Exception as error:

        raise HTTPException(
            status_code=500,
            detail=f"Unable to fetch live weather data: {str(error)}",
        )

    @router.get("/readings/{location_id}/live")
    def get_live_environment_data(
        location_id: int,
        db: Session = Depends(get_db),
    ):
        """
        Fetch real-time environmental data
        for a monitored location.
        """

    locations = {
        1: {
                "name": "Aizawl",
                "latitude": 23.7271,
                "longitude": 92.7176,
        },
        2: {
            "name": "Shillong",
            "latitude": 25.5788,
            "longitude": 91.8933,
        },
        3: {
            "name": "Kohima",
            "latitude": 25.6751,
            "longitude": 94.1086,
        },
    }

    location = locations.get(location_id)

    if not location:
        raise HTTPException(
            status_code=404,
            detail="Location not found",
        )

    try:
        weather_data = weather_service.get_live_weather(
            latitude=location["latitude"],
            longitude=location["longitude"],
        )

        current = weather_data["current"]

        return {
            "location": location["name"],
            "location_id": location_id,
            "latitude": location["latitude"],
            "longitude": location["longitude"],
            "temperature": current.get("temperature_2m"),
            "humidity": current.get("relative_humidity_2m"),
            "rain": current.get("rain"),
            "precipitation": current.get("precipitation"),
            "wind_speed": current.get("wind_speed_10m"),
            "source": "Live Weather API",
        }

    except Exception as error:
        raise HTTPException(
            status_code=500,
            detail=f"Unable to fetch live weather data: {str(error)}",
        )


# IMPORTANT: No indentation before this decorator
@router.get("/readings/{location_id}/live-risk")
def get_live_landslide_risk(
    location_id: int,
):
    """
    Calculate landslide risk using
    real-time environmental data.
    """

    locations = {
        1: {
            "name": "Aizawl",
            "latitude": 23.7271,
            "longitude": 92.7176,
        },
        2: {
            "name": "Shillong",
            "latitude": 25.5788,
            "longitude": 91.8933,
        },
        3: {
            "name": "Kohima",
            "latitude": 25.6751,
            "longitude": 94.1086,
        },
    }

    location = locations.get(location_id)

    if not location:
        raise HTTPException(
            status_code=404,
            detail="Location not found",
        )

    try:
        weather_data = weather_service.get_live_weather(
            latitude=location["latitude"],
            longitude=location["longitude"],
        )

        current = weather_data["current"]

        rainfall = current.get("rain") or 0
        precipitation = current.get("precipitation") or 0
        humidity = current.get("relative_humidity_2m") or 0
        wind_speed = current.get("wind_speed_10m") or 0

        risk = risk_engine.calculate_landslide_risk(
            rainfall=rainfall,
            precipitation=precipitation,
            humidity=humidity,
            wind_speed=wind_speed,
        )

        return {
            "location": location["name"],
            "location_id": location_id,

            "environment": {
                "rainfall": rainfall,
                "precipitation": precipitation,
                "humidity": humidity,
                "wind_speed": wind_speed,
            },

            "risk_score": risk["risk_score"],
            "risk_level": risk["risk_level"],

            "source": (
                "Live Weather API + "
                "SlopeShield Risk Engine"
            ),
        }

    except Exception as error:
        raise HTTPException(
            status_code=500,
            detail=(
                "Unable to calculate live risk: "
                f"{str(error)}"
            ),
        )