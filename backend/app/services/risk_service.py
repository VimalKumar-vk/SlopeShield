from datetime import datetime

import httpx
from sqlalchemy.orm import Session

from app.database.models import (
    Location,
    RiskAssessment,
)

from app.services import alert_service


OPEN_METEO_URL = "https://api.open-meteo.com/v1/forecast"


# =========================================================
# BASIC DATABASE FUNCTIONS
# =========================================================

def get_risks(db: Session):
    return (
        db.query(RiskAssessment)
        .order_by(RiskAssessment.timestamp.desc())
        .all()
    )


def get_risk(risk_id: int, db: Session):
    return (
        db.query(RiskAssessment)
        .filter(RiskAssessment.id == risk_id)
        .first()
    )


def get_location_risks(location_id: int, db: Session):
    return (
        db.query(RiskAssessment)
        .filter(
            RiskAssessment.location_id == location_id
        )
        .order_by(
            RiskAssessment.timestamp.desc()
        )
        .all()
    )


# =========================================================
# API FUNCTIONS
# =========================================================

def get_risk_overview(db: Session):

    return (
        db.query(RiskAssessment)
        .order_by(
            RiskAssessment.timestamp.desc()
        )
        .first()
    )


def get_risk_locations(db: Session):

    return (
        db.query(RiskAssessment)
        .order_by(
            RiskAssessment.timestamp.desc()
        )
        .all()
    )


def get_risk_location(
    location_id: int,
    db: Session,
):

    return (
        db.query(RiskAssessment)
        .filter(
            RiskAssessment.location_id == location_id
        )
        .order_by(
            RiskAssessment.timestamp.desc()
        )
        .first()
    )


# =========================================================
# MANUAL RISK PREDICTION
# =========================================================

def predict_risk(
    risk_data,
    db: Session,
):

    risk = RiskAssessment(
        location_id=risk_data.location_id,

        timestamp=(
            risk_data.timestamp
            or datetime.utcnow()
        ),

        risk_score=risk_data.risk_score,

        risk_level=risk_data.risk_level,

        ml_score=risk_data.ml_score,

        rule_score=risk_data.rule_score,
    )

    db.add(risk)
    db.commit()
    db.refresh(risk)

    # -----------------------------------------------------
    # AUTOMATIC ALERT CREATION
    # -----------------------------------------------------

    location = (
        db.query(Location)
        .filter(
            Location.id == risk.location_id
        )
        .first()
    )

    if location:

        alert_service.create_alert(
            location=location,
            risk_assessment=risk,
            db=db,
        )

    return risk


# =========================================================
# WEATHER DATA BY COORDINATES
# =========================================================

def get_weather_by_coordinates(
    latitude: float,
    longitude: float,
):

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
# CALCULATE RAINFALL
# =========================================================

def calculate_rainfall(
    hourly_data,
):

    precipitation = (
        hourly_data.get("precipitation") or []
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
# CALCULATE ENVIRONMENTAL FACTORS
# =========================================================

def extract_environmental_data(
    weather_data,
):

    hourly = weather_data.get(
        "hourly",
        {},
    )

    current = weather_data.get(
        "current",
        {},
    )

    rainfall = calculate_rainfall(
        hourly
    )

    soil_values = (
        hourly.get(
            "soil_moisture_0_to_7cm"
        )
        or []
    )

    if soil_values:

        soil_moisture = (
            soil_values[-1]
        )

    else:

        soil_moisture = (
            current.get(
                "soil_moisture_0_to_7cm"
            )
            or 0
        )

    # Open-Meteo soil moisture is a fraction.
    # Convert to percentage.

    soil_moisture_percentage = (
        soil_moisture * 100
    )

    return {

        "rainfall_24h": rainfall[
            "rainfall_24h"
        ],

        "rainfall_72h": rainfall[
            "rainfall_72h"
        ],

        "soil_moisture": round(
            soil_moisture_percentage,
            2,
        ),

        "temperature": current.get(
            "temperature_2m"
        ),

        "humidity": current.get(
            "relative_humidity_2m"
        ),

        "current_rain": current.get(
            "rain"
        ),
    }


# =========================================================
# RISK CALCULATION
# =========================================================

def calculate_risk_score(
    rainfall_24h,
    rainfall_72h,
    soil_moisture,
):

    # -----------------------------------------------------
    # RAINFALL 24H SCORE
    # -----------------------------------------------------

    rainfall_24h_score = min(
        rainfall_24h / 100 * 100,
        100,
    )

    # -----------------------------------------------------
    # RAINFALL 72H SCORE
    # -----------------------------------------------------

    rainfall_72h_score = min(
        rainfall_72h / 250 * 100,
        100,
    )

    # -----------------------------------------------------
    # SOIL MOISTURE SCORE
    # -----------------------------------------------------

    soil_score = min(
        soil_moisture,
        100,
    )

    # -----------------------------------------------------
    # RULE BASED SCORE
    # -----------------------------------------------------

    rule_score = (

        rainfall_24h_score * 0.35

        + rainfall_72h_score * 0.40

        + soil_score * 0.25

    )

    rule_score = max(
        0,
        min(
            rule_score,
            100,
        ),
    )

    # -----------------------------------------------------
    # ML SCORE
    # -----------------------------------------------------
    #
    # Currently using environmental score as
    # temporary ML component.
    #
    # Later replace this with trained ML model.
    #

    ml_score = rule_score

    # -----------------------------------------------------
    # FINAL RISK SCORE
    # -----------------------------------------------------

    risk_score = (

        rule_score * 0.60

        + ml_score * 0.40

    )

    risk_score = round(
        max(
            0,
            min(
                risk_score,
                100,
            ),
        ),
        2,
    )

    # -----------------------------------------------------
    # RISK LEVEL
    # -----------------------------------------------------

    if risk_score >= 90:

        risk_level = "SEVERE"

    elif risk_score >= 70:

        risk_level = "HIGH"

    elif risk_score >= 40:

        risk_level = "MODERATE"

    else:

        risk_level = "LOW"

    return {

        "risk_score": risk_score,

        "risk_level": risk_level,

        "ml_score": round(
            ml_score,
            2,
        ),

        "rule_score": round(
            rule_score,
            2,
        ),
    }


# =========================================================
# PREDICT RISK USING LATITUDE + LONGITUDE
# =========================================================

def predict_risk_by_coordinates(
    latitude: float,
    longitude: float,
    db: Session,
):

    # -----------------------------------------------------
    # VALIDATE COORDINATES
    # -----------------------------------------------------

    if latitude < -90 or latitude > 90:

        raise ValueError(
            "Latitude must be between -90 and 90."
        )

    if longitude < -180 or longitude > 180:

        raise ValueError(
            "Longitude must be between -180 and 180."
        )

    # -----------------------------------------------------
    # GET REAL WEATHER
    # -----------------------------------------------------

    weather_data = get_weather_by_coordinates(
        latitude,
        longitude,
    )

    # -----------------------------------------------------
    # EXTRACT ENVIRONMENTAL DATA
    # -----------------------------------------------------

    environmental = extract_environmental_data(
        weather_data
    )

    # -----------------------------------------------------
    # CALCULATE RISK
    # -----------------------------------------------------

    risk = calculate_risk_score(

        rainfall_24h=environmental[
            "rainfall_24h"
        ],

        rainfall_72h=environmental[
            "rainfall_72h"
        ],

        soil_moisture=environmental[
            "soil_moisture"
        ],
    )

    # -----------------------------------------------------
    # FIND OR CREATE LOCATION
    # -----------------------------------------------------

    location = (
        db.query(Location)
        .filter(
            Location.latitude == latitude,
            Location.longitude == longitude,
        )
        .first()
    )

    if not location:

        location = Location(

            name=(
                f"Coordinate Location "
                f"{latitude:.4f}, "
                f"{longitude:.4f}"
            ),

            district="Unknown",

            state="Unknown",

            latitude=latitude,

            longitude=longitude,

        )

        db.add(location)
        db.commit()
        db.refresh(location)

    # -----------------------------------------------------
    # SAVE RISK ASSESSMENT
    # -----------------------------------------------------

    risk_assessment = RiskAssessment(

        location_id=location.id,

        timestamp=datetime.utcnow(),

        risk_score=risk["risk_score"],

        risk_level=risk["risk_level"],

        ml_score=risk["ml_score"],

        rule_score=risk["rule_score"],
    )

    db.add(risk_assessment)
    db.commit()
    db.refresh(risk_assessment)

    # -----------------------------------------------------
    # AUTOMATIC ALERT CREATION
    # -----------------------------------------------------

    alert = alert_service.create_alert(

        location=location,

        risk_assessment=risk_assessment,

        db=db,

    )

    # -----------------------------------------------------
    # RETURN COMPLETE RESULT
    # -----------------------------------------------------

    return {

        "latitude": latitude,

        "longitude": longitude,

        "environmental": environmental,

        "risk": risk,

        "alert": (

            {
                "id": alert.id,

                "severity": alert.severity,

                "status": alert.status,

                "message": alert.message,

                "created_at": (
                    alert.created_at.isoformat()
                    if alert.created_at
                    else None
                ),
            }

            if alert

            else None
        ),

        "source": "Open-Meteo",

    }


# =========================================================
# CRUD
# =========================================================

def create_risk(
    risk_data,
    db: Session,
):

    risk = RiskAssessment(

        location_id=risk_data.location_id,

        timestamp=(
            risk_data.timestamp
            or datetime.utcnow()
        ),

        risk_score=risk_data.risk_score,

        risk_level=risk_data.risk_level,

        ml_score=risk_data.ml_score,

        rule_score=risk_data.rule_score,
    )

    db.add(risk)

    db.commit()

    db.refresh(risk)

    # Automatic alert

    location = (
        db.query(Location)
        .filter(
            Location.id == risk.location_id
        )
        .first()
    )

    if location:

        alert_service.create_alert(
            location=location,
            risk_assessment=risk,
            db=db,
        )

    return risk


def update_risk(
    risk_id: int,
    risk_data,
    db: Session,
):

    risk = get_risk(
        risk_id,
        db,
    )

    if not risk:

        return None

    risk.location_id = (
        risk_data.location_id
    )

    risk.timestamp = (
        risk_data.timestamp
        or datetime.utcnow()
    )

    risk.risk_score = (
        risk_data.risk_score
    )

    risk.risk_level = (
        risk_data.risk_level
    )

    risk.ml_score = (
        risk_data.ml_score
    )

    risk.rule_score = (
        risk_data.rule_score
    )

    db.commit()

    db.refresh(risk)

    return risk


def delete_risk(
    risk_id: int,
    db: Session,
):

    risk = get_risk(
        risk_id,
        db,
    )

    if not risk:

        return False

    db.delete(risk)

    db.commit()

    return True