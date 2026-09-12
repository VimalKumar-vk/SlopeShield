import httpx

from app.services.vegetation_service import get_vegetation_index
from app.database.models import EnvironmentalReading, Location
from app.database.session import SessionLocal


OPEN_METEO_URL = "https://api.open-meteo.com/v1/forecast"


# =========================================================
# 1. GET WEATHER DATA USING LATITUDE + LONGITUDE
# =========================================================

def get_weather_data(latitude: float, longitude: float):
    """
    Fetch weather and environmental data
    using latitude and longitude.
    """

    if not (-90 <= latitude <= 90):
        raise ValueError("Invalid latitude")

    if not (-180 <= longitude <= 180):
        raise ValueError("Invalid longitude")

    params = {
        "latitude": latitude,
        "longitude": longitude,

        "current": (
            "temperature_2m,"
            "relative_humidity_2m,"
            "rain,"
            "precipitation,"
            "soil_moisture_0_to_7cm"
        ),

        "hourly": (
            "precipitation,"
            "soil_moisture_0_to_7cm"
        ),

        "past_days": 3,
        "forecast_days": 0,
        "timezone": "auto",
    }

    response = httpx.get(
        OPEN_METEO_URL,
        params=params,
        timeout=15.0,
    )

    response.raise_for_status()

    return response.json()


# =========================================================
# 2. GET WEATHER DATA DIRECTLY BY COORDINATES
# =========================================================

def get_weather_data_by_coordinates(
    latitude: float,
    longitude: float,
):
    """
    Fetch live environmental data directly
    from latitude and longitude.
    """

    weather_data = get_weather_data(
        latitude,
        longitude,
    )

    hourly = weather_data.get(
        "hourly",
        {},
    )

    precipitation = hourly.get(
        "precipitation",
        [],
    )

    soil_moisture_values = hourly.get(
        "soil_moisture_0_to_7cm",
        [],
    )

    # -----------------------------------------------------
    # Rainfall - last 24 hours
    # -----------------------------------------------------

    rainfall_24h = sum(
        value or 0
        for value in precipitation[-24:]
    )

    # -----------------------------------------------------
    # Rainfall - last 72 hours
    # -----------------------------------------------------

    rainfall_72h = sum(
        value or 0
        for value in precipitation[-72:]
    )

    # -----------------------------------------------------
    # Latest soil moisture
    # -----------------------------------------------------

    soil_moisture = 0

    if soil_moisture_values:

        latest_soil = soil_moisture_values[-1]

        if latest_soil is not None:
            soil_moisture = latest_soil * 100

    # -----------------------------------------------------
    # Current weather
    # -----------------------------------------------------

    current = weather_data.get(
        "current",
        {},
    )

    temperature = current.get(
        "temperature_2m"
    )

    humidity = current.get(
        "relative_humidity_2m"
    )

    current_rain = current.get(
        "rain"
    )

    current_precipitation = current.get(
        "precipitation"
    )

    # -----------------------------------------------------
    # Return clean data
    # -----------------------------------------------------

    return {
        "latitude": latitude,
        "longitude": longitude,

        "temperature": temperature,
        "humidity": humidity,

        "rain": current_rain,
        "precipitation": current_precipitation,

        "rainfall_24h": round(
            rainfall_24h,
            2,
        ),

        "rainfall_72h": round(
            rainfall_72h,
            2,
        ),

        "soil_moisture": round(
            soil_moisture,
            2,
        ),
    }


# =========================================================
# 3. LIVE WEATHER FUNCTION
# =========================================================

def get_live_weather(
    latitude: float,
    longitude: float,
):
    """
    Fetch live environmental data
    for the live weather and risk APIs.
    """

    return get_weather_data_by_coordinates(
        latitude,
        longitude,
    )


# =========================================================
# 4. CALCULATE RAINFALL
# =========================================================

def calculate_rainfall(hourly_data):

    precipitation = hourly_data.get(
        "precipitation",
        [],
    )

    rainfall_24h = sum(
        value or 0
        for value in precipitation[-24:]
    )

    rainfall_72h = sum(
        value or 0
        for value in precipitation[-72:]
    )

    return {
        "rainfall_24h": round(
            rainfall_24h,
            2,
        ),

        "rainfall_72h": round(
            rainfall_72h,
            2,
        ),
    }


# =========================================================
# 5. EXTRACT ENVIRONMENTAL DATA
# =========================================================

def extract_environmental_data(weather_data):

    hourly = weather_data.get(
        "hourly",
        {},
    )

    rainfall = calculate_rainfall(
        hourly
    )

    soil_moisture_values = hourly.get(
        "soil_moisture_0_to_7cm",
        [],
    )

    soil_moisture = 0

    if soil_moisture_values:

        latest_soil = soil_moisture_values[-1]

        if latest_soil is not None:
            soil_moisture = latest_soil * 100

    return {
        "rainfall_24h": rainfall[
            "rainfall_24h"
        ],

        "rainfall_72h": rainfall[
            "rainfall_72h"
        ],

        "soil_moisture": round(
            soil_moisture,
            2,
        ),
    }


# =========================================================
# 6. COLLECT WEATHER FOR DATABASE LOCATION
# =========================================================

def collect_weather_for_location(
    location_id: int,
):

    db = SessionLocal()

    try:

        location = (
            db.query(Location)
            .filter(
                Location.id == location_id
            )
            .first()
        )

        if not location:
            raise ValueError(
                f"Location {location_id} not found"
            )

        # -------------------------------------------------
        # Get live weather
        # -------------------------------------------------

        weather_data = get_weather_data(
            location.latitude,
            location.longitude,
        )

        # -------------------------------------------------
        # Extract environmental data
        # -------------------------------------------------

        environmental = extract_environmental_data(
            weather_data
        )

        # -------------------------------------------------
        # Get vegetation index
        # -------------------------------------------------

        vegetation_index = get_vegetation_index(
            latitude=location.latitude,
            longitude=location.longitude,
        )

        # -------------------------------------------------
        # Save reading into database
        # -------------------------------------------------

        reading = EnvironmentalReading(
            location_id=location.id,

            rainfall_24h=environmental[
                "rainfall_24h"
            ],

            rainfall_72h=environmental[
                "rainfall_72h"
            ],

            soil_moisture=environmental[
                "soil_moisture"
            ],

            vegetation_index=vegetation_index,
        )

        db.add(reading)

        db.commit()

        db.refresh(reading)

        print(
            "Weather + vegetation data saved to database:"
        )

        print(
            {
                "id": reading.id,
                "location_id": reading.location_id,
                "rainfall_24h": reading.rainfall_24h,
                "rainfall_72h": reading.rainfall_72h,
                "soil_moisture": reading.soil_moisture,
                "vegetation_index": reading.vegetation_index,
            }
        )

        return reading

    except Exception:

        db.rollback()

        raise

    finally:

        db.close()