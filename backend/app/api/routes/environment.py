from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

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