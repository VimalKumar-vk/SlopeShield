from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.schemas import Location, LocationCreate, LocationUpdate
from app.services import location_service

router = APIRouter()

@router.get("/locations", response_model=list[Location])
def get_locations(db: Session = Depends(get_db)):
    return location_service.get_locations(db)

@router.get("/locations/{location_id}", response_model=Location)
def get_location(location_id: int, db: Session = Depends(get_db)):
    location = location_service.get_location(location_id, db)
    if not location:
        raise HTTPException(status_code=404, detail="Location not found")
    return location

@router.get("/locations/{location_id}/latest", response_model=Location)
def get_location_latest(location_id: int, db: Session = Depends(get_db)):
    location = location_service.get_location(location_id, db)
    if not location:
        raise HTTPException(status_code=404, detail="Location not found")
    return location

@router.get("/locations/{location_id}/history", response_model=list[Location])
def get_location_history(location_id: int, db: Session = Depends(get_db)):
    location = location_service.get_location(location_id, db)
    if not location:
        raise HTTPException(status_code=404, detail="Location not found")
    return location
