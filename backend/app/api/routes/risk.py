from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.schemas import Risk, RiskCreate, RiskUpdate
from app.services import risk_service


router = APIRouter()


# =========================================================
# RISK OVERVIEW
# =========================================================

@router.get(
    "/risk/overview",
    response_model=Risk,
)
def get_risk_overview(
    db: Session = Depends(get_db),
):
    risk = risk_service.get_risk_overview(db)

    if not risk:
        raise HTTPException(
            status_code=404,
            detail="No risk assessment found",
        )

    return risk


# =========================================================
# ALL RISK LOCATIONS
# =========================================================

@router.get(
    "/risk/locations",
    response_model=list[Risk],
)
def get_risk_locations(
    db: Session = Depends(get_db),
):
    return risk_service.get_risk_locations(db)


# =========================================================
# RISK FOR ONE DATABASE LOCATION
# =========================================================

@router.get(
    "/risk/locations/{location_id}",
    response_model=Risk,
)
def get_risk_location(
    location_id: int,
    db: Session = Depends(get_db),
):

    risk = risk_service.get_risk_location(
        location_id,
        db,
    )

    if not risk:
        raise HTTPException(
            status_code=404,
            detail="Risk not found",
        )

    return risk


# =========================================================
# MANUAL RISK PREDICTION
# =========================================================

@router.post(
    "/risk/predict",
    response_model=Risk,
)
def predict_risk(
    risk_create: RiskCreate,
    db: Session = Depends(get_db),
):

    return risk_service.predict_risk(
        risk_create,
        db,
    )


# =========================================================
# RISK PREDICTION BY COORDINATES
# =========================================================

@router.get(
    "/risk/predict-by-coordinates"
)
def predict_risk_by_coordinates(
    latitude: float,
    longitude: float,
    db: Session = Depends(get_db),
):

    # -----------------------------------------------------
    # Validate latitude
    # -----------------------------------------------------

    if latitude < -90 or latitude > 90:
        raise HTTPException(
            status_code=400,
            detail="Latitude must be between -90 and 90",
        )

    # -----------------------------------------------------
    # Validate longitude
    # -----------------------------------------------------

    if longitude < -180 or longitude > 180:
        raise HTTPException(
            status_code=400,
            detail="Longitude must be between -180 and 180",
        )

    try:

        result = (
            risk_service.predict_risk_by_coordinates(
                latitude=latitude,
                longitude=longitude,
                db=db,
            )
        )

        return result

    except ValueError as exc:

        raise HTTPException(
            status_code=400,
            detail=str(exc),
        ) from exc

    except Exception as exc:

        print(
            "Coordinate risk prediction error:",
            exc,
        )

        raise HTTPException(
            status_code=500,
            detail="Unable to calculate risk for coordinates",
        ) from exc