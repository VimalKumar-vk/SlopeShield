from datetime import datetime

from sqlalchemy.orm import Session

from app.core.constants import RISK_LEVELS
from app.database.models import Location, RiskAssessment
from app.services.ml_service import predict_ml_risk


def _clamp(value, minimum=0.0, maximum=100.0):
    return max(minimum, min(float(value), maximum))


def _latest_reading(location: Location):
    if not location.environmental_readings:
        raise ValueError(
            f"No environmental readings available for location {location.id}"
        )

    return location.environmental_readings[-1]


def calculate_rule_score(factors):
    rainfall_24h_score = _clamp(
        factors["rainfall_24h"] / 300 * 100
    )

    rainfall_72h_score = _clamp(
        factors["rainfall_72h"] / 600 * 100
    )

    slope_score = _clamp(
        factors["slope"] / 60 * 100
    )

    soil_moisture_score = _clamp(
        factors["soil_moisture"]
    )

    vegetation_score = _clamp(
        (1 - factors["vegetation_index"]) * 100
    )

    road_score = _clamp(
        (1 - min(factors["distance_to_road"], 2000) / 2000) * 100
    )

    river_score = _clamp(
        (1 - min(factors["distance_to_river"], 2000) / 2000) * 100
    )

    elevation_score = _clamp(
        factors["elevation"] / 3000 * 100
    )

    weighted_score = (
        rainfall_24h_score * 0.18
        + rainfall_72h_score * 0.22
        + slope_score * 0.20
        + soil_moisture_score * 0.15
        + vegetation_score * 0.08
        + road_score * 0.05
        + river_score * 0.07
        + elevation_score * 0.05
    )

    return round(_clamp(weighted_score), 2)


def get_risk_level(score):
    score = _clamp(score)

    for level, (minimum, maximum) in RISK_LEVELS.items():
        if minimum <= score <= maximum:
            return level

    return "SEVERE"


def calculate_risk(location: Location, db: Session):
    reading = _latest_reading(location)

    factors = {
        "rainfall_24h": reading.rainfall_24h,
        "rainfall_72h": reading.rainfall_72h,
        "slope": location.slope,
        "elevation": location.elevation,
        "soil_moisture": reading.soil_moisture,
        "vegetation_index": reading.vegetation_index,
        "distance_to_road": location.distance_to_road,
        "distance_to_river": location.distance_to_river,
    }

    rule_score = calculate_rule_score(factors)

    ml_score = predict_ml_risk(factors)

    final_risk_score = round(
        _clamp(
            0.60 * rule_score
            + 0.40 * ml_score
        ),
        2,
    )

    risk_level = get_risk_level(final_risk_score)

    assessment = RiskAssessment(
        location_id=location.id,
        timestamp=datetime.utcnow(),
        risk_score=final_risk_score,
        risk_level=risk_level,
        ml_score=ml_score,
        rule_score=rule_score,
    )

    db.add(assessment)
    db.commit()
    db.refresh(assessment)

    return assessment