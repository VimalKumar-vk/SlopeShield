from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.schemas import Risk, RiskCreate, RiskUpdate
from app.services import risk_service

router = APIRouter()

@router.get("/risk/overview", response_model=Risk)
def get_risk_overview(db: Session = Depends(get_db)):
    return risk_service.get_risk_overview(db)

@router.get("/risk/locations", response_model=list[Risk])
def get_risk_locations(db: Session = Depends(get_db)):
    return risk_service.get_risk_locations(db)

@router.get("/risk/locations/{location_id}", response_model=Risk)
def get_risk_location(location_id: int, db: Session = Depends(get_db)):
    risk = risk_service.get_risk_location(location_id, db)
    if not risk:
        raise HTTPException(status_code=404, detail="Risk not found")
    return risk

@router.post("/risk/predict", response_model=Risk)
def predict_risk(risk_create: RiskCreate, db: Session = Depends(get_db)):
    return risk_service.predict_risk(risk_create, db)
