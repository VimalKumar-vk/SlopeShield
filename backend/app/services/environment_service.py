from fastapi import HTTPException
from sqlalchemy.orm import Session

from app.database.models import EnvironmentalReading, Location


def get_readings(db: Session):
    return (
        db.query(EnvironmentalReading)
        .order_by(EnvironmentalReading.timestamp.desc())
        .all()
    )


def get_reading(reading_id: int, db: Session):
    return (
        db.query(EnvironmentalReading)
        .filter(EnvironmentalReading.id == reading_id)
        .first()
    )


def get_location_readings(location_id: int, db: Session):
    return (
        db.query(EnvironmentalReading)
        .filter(EnvironmentalReading.location_id == location_id)
        .order_by(EnvironmentalReading.timestamp.desc())
        .all()
    )


def get_latest_location_reading(location_id: int, db: Session):
    return (
        db.query(EnvironmentalReading)
        .filter(EnvironmentalReading.location_id == location_id)
        .order_by(EnvironmentalReading.timestamp.desc())
        .first()
    )


def create_reading(reading_data, db: Session):

    location = (
        db.query(Location)
        .filter(Location.id == reading_data.location_id)
        .first()
    )

    if not location:
        raise HTTPException(
            status_code=404,
            detail="Location not found",
        )

    reading = EnvironmentalReading(
        location_id=reading_data.location_id,
        timestamp=reading_data.timestamp,
        rainfall_24h=reading_data.rainfall_24h,
        rainfall_72h=reading_data.rainfall_72h,
        soil_moisture=reading_data.soil_moisture,
        vegetation_index=reading_data.vegetation_index,
    )

    db.add(reading)
    db.commit()
    db.refresh(reading)

    return reading


def update_reading(reading_id: int, reading_data, db: Session):

    reading = get_reading(reading_id, db)

    if not reading:
        return None

    location = (
        db.query(Location)
        .filter(Location.id == reading_data.location_id)
        .first()
    )

    if not location:
        raise HTTPException(
            status_code=404,
            detail="Location not found",
        )

    reading.location_id = reading_data.location_id
    reading.timestamp = reading_data.timestamp
    reading.rainfall_24h = reading_data.rainfall_24h
    reading.rainfall_72h = reading_data.rainfall_72h
    reading.soil_moisture = reading_data.soil_moisture
    reading.vegetation_index = reading_data.vegetation_index

    db.commit()
    db.refresh(reading)

    return reading

def delete_reading(reading_id: int, db: Session):
    reading = get_reading(reading_id, db)

    if not reading:
        return False

    db.delete(reading)
    db.commit()

    return True