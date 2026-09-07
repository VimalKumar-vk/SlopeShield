import httpx

from app.database.models import EnvironmentalReading, Location
from app.database.session import SessionLocal


OPEN_METEO_URL = "https://api.open-meteo.com/v1/forecast"


def get_weather_data(latitude: float, longitude: float):
    params = {
        "latitude": latitude,
        "longitude": longitude,

        "current": (
            "temperature_2m,"
            "relative_humidity_2m,"
            "rain,"
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
        timeout=10.0,
    )

    response.raise_for_status()

    return response.json()


def calculate_rainfall(hourly_data):
    precipitation = hourly_data["precipitation"]

    # Last 24 hourly values
    rainfall_24h = sum(precipitation[-24:])

    # Last 72 hourly values
    rainfall_72h = sum(precipitation[-72:])

    return {
        "rainfall_24h": round(rainfall_24h, 2),
        "rainfall_72h": round(rainfall_72h, 2),
    }


def extract_environmental_data(weather_data):
    hourly = weather_data["hourly"]

    rainfall = calculate_rainfall(hourly)

    soil_moisture = hourly["soil_moisture_0_to_7cm"][-1]

    return {
        "rainfall_24h": rainfall["rainfall_24h"],
        "rainfall_72h": rainfall["rainfall_72h"],

        # Convert 0–1 fraction into percentage
        "soil_moisture": round(soil_moisture * 100, 2),
    }


def collect_weather_for_location(location_id: int):
    db = SessionLocal()

    try:
        location = (
            db.query(Location)
            .filter(Location.id == location_id)
            .first()
        )

        if not location:
            raise ValueError(
                f"Location {location_id} not found"
            )

        # Get live weather from Open-Meteo
        weather_data = get_weather_data(
            location.latitude,
            location.longitude,
        )

        # Extract rainfall and soil moisture
        environmental = extract_environmental_data(
            weather_data
        )

        # Open-Meteo currently does not provide vegetation index
        vegetation_index = None

        # Create database reading
        reading = EnvironmentalReading(
            location_id=location.id,
            rainfall_24h=environmental["rainfall_24h"],
            rainfall_72h=environmental["rainfall_72h"],
            soil_moisture=environmental["soil_moisture"],
            vegetation_index=vegetation_index,
        )

        db.add(reading)
        db.commit()
        db.refresh(reading)

        print("Weather data saved to database:")
        print({
            "id": reading.id,
            "location_id": reading.location_id,
            "rainfall_24h": reading.rainfall_24h,
            "rainfall_72h": reading.rainfall_72h,
            "soil_moisture": reading.soil_moisture,
            "vegetation_index": reading.vegetation_index,
        })

        return reading

    except Exception:
        db.rollback()
        raise

    finally:
        db.close()