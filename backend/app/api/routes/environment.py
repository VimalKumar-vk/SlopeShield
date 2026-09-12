from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.services import weather_service
from app.services import risk_engine
from app.services import environment_service
from app.services.vegetation_service import get_vegetation_index

from app.database.session import get_db

from app.schemas import (
    EnvironmentalReading,
    EnvironmentalReadingCreate,
    EnvironmentalReadingUpdate,
)


router = APIRouter()


# =========================================================
# EXISTING ENVIRONMENTAL READING APIs
# =========================================================

@router.get(
    "/readings",
    response_model=list[EnvironmentalReading],
)
def get_readings(
    db: Session = Depends(get_db),
):
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
)
def create_reading(
    reading: EnvironmentalReadingCreate,
    db: Session = Depends(get_db),
):
    return environment_service.create_reading(
        reading,
        db,
    )


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


@router.delete(
    "/readings/{reading_id}"
)
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


# =========================================================
# LOCATION CONFIGURATION
# =========================================================

LOCATIONS = {
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


# =========================================================
# LIVE ENVIRONMENTAL DATA
# =========================================================

@router.get(
    "/readings/{location_id}/live"
)
def get_live_environment_data(
    location_id: int,
):
    """
    Fetch real-time environmental data
    for a monitored location.
    """

    location = LOCATIONS.get(location_id)

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

        return {
            "location": location["name"],
            "location_id": location_id,

            "latitude": location["latitude"],
            "longitude": location["longitude"],

            "temperature": weather_data.get(
                "temperature"
            ),

            "humidity": weather_data.get(
                "humidity"
            ),

            "rain": weather_data.get(
                "rain"
            ),

            "precipitation": weather_data.get(
                "precipitation"
            ),

            "rainfall_24h": weather_data.get(
                "rainfall_24h",
                0,
            ),

            "rainfall_72h": weather_data.get(
                "rainfall_72h",
                0,
            ),

            "soil_moisture": weather_data.get(
                "soil_moisture",
                0,
            ),

            "wind_speed": weather_data.get(
                "wind_speed"
            ),

            "source": "Live Weather API",
        }

    except Exception as error:

        raise HTTPException(
            status_code=500,
            detail=(
                "Unable to fetch live weather data: "
                f"{str(error)}"
            ),
        )


# =========================================================
# LIVE LANDSLIDE RISK
# =========================================================

@router.get(
    "/readings/{location_id}/live-risk"
)
def get_live_landslide_risk(
    location_id: int,
):
    """
    Calculate landslide risk using
    real-time environmental data.
    """

    location = LOCATIONS.get(location_id)

    if not location:
        raise HTTPException(
            status_code=404,
            detail="Location not found",
        )

    try:

        # -------------------------------------------------
        # Get live weather
        # -------------------------------------------------

        weather_data = weather_service.get_live_weather(
            latitude=location["latitude"],
            longitude=location["longitude"],
        )

        # -------------------------------------------------
        # Weather values
        # -------------------------------------------------

        temperature = weather_data.get(
            "temperature",
            0,
        )

        humidity = weather_data.get(
            "humidity",
            0,
        )

        rainfall_24h = weather_data.get(
            "rainfall_24h",
            0,
        )

        rainfall_72h = weather_data.get(
            "rainfall_72h",
            0,
        )

        precipitation = weather_data.get(
            "precipitation",
            0,
        )

        soil_moisture = weather_data.get(
            "soil_moisture",
            0,
        )

        rain = weather_data.get(
            "rain",
            0,
        )

        wind_speed = weather_data.get(
            "wind_speed",
            0,
        ) or 0

        # -------------------------------------------------
        # Get NDVI
        # -------------------------------------------------

        vegetation_index = get_vegetation_index(
            latitude=location["latitude"],
            longitude=location["longitude"],
        )

        # -------------------------------------------------
        # Calculate landslide risk
        # -------------------------------------------------

        risk = risk_engine.calculate_landslide_risk(
            rainfall=rainfall_24h,
            precipitation=precipitation,
            humidity=humidity,
            wind_speed=wind_speed,
        )

        # -------------------------------------------------
        # Final response
        # -------------------------------------------------

        return {
            "location": location["name"],
            "location_id": location_id,

            "latitude": location["latitude"],
            "longitude": location["longitude"],

            "environment": {

                "temperature": temperature,

                "humidity": humidity,

                "rain": rain,

                "precipitation": precipitation,

                "rainfall_24h": rainfall_24h,

                "rainfall_72h": rainfall_72h,

                "soil_moisture": soil_moisture,

                "vegetation_index": vegetation_index,

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