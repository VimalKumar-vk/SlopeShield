from datetime import datetime

from sqlalchemy.orm import Session

from app.database.models import RiskAssessment


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
        .filter(RiskAssessment.location_id == location_id)
        .order_by(RiskAssessment.timestamp.desc())
        .all()
    )


# =========================================================
# API FUNCTIONS USED BY app/api/routes/risk.py
# =========================================================

def get_risk_overview(db: Session):
    """
    Return the latest risk assessment across all locations.
    """

    return (
        db.query(RiskAssessment)
        .order_by(RiskAssessment.timestamp.desc())
        .first()
    )


def get_risk_locations(db: Session):
    """
    Return the latest available risk assessment records.
    """

    return (
        db.query(RiskAssessment)
        .order_by(RiskAssessment.timestamp.desc())
        .all()
    )


def get_risk_location(location_id: int, db: Session):
    """
    Return the latest risk assessment for one location.
    """

    return (
        db.query(RiskAssessment)
        .filter(RiskAssessment.location_id == location_id)
        .order_by(RiskAssessment.timestamp.desc())
        .first()
    )


def predict_risk(risk_data, db: Session):
    """
    Store a risk prediction in the database.

    At this stage this endpoint accepts the calculated ML and
    rule-based scores. Later we can replace this with the actual
    AI/ML prediction engine.
    """

    risk = RiskAssessment(
        location_id=risk_data.location_id,
        timestamp=risk_data.timestamp or datetime.utcnow(),
        risk_score=risk_data.risk_score,
        risk_level=risk_data.risk_level,
        ml_score=risk_data.ml_score,
        rule_score=risk_data.rule_score,
    )

    db.add(risk)
    db.commit()
    db.refresh(risk)

    return risk


# =========================================================
# CRUD FUNCTIONS
# =========================================================

def create_risk(risk_data, db: Session):
    risk = RiskAssessment(
        location_id=risk_data.location_id,
        timestamp=risk_data.timestamp,
        risk_score=risk_data.risk_score,
        risk_level=risk_data.risk_level,
        ml_score=risk_data.ml_score,
        rule_score=risk_data.rule_score,
    )

    db.add(risk)
    db.commit()
    db.refresh(risk)

    return risk


def update_risk(risk_id: int, risk_data, db: Session):
    risk = get_risk(risk_id, db)

    if not risk:
        return None

    risk.location_id = risk_data.location_id
    risk.timestamp = risk_data.timestamp
    risk.risk_score = risk_data.risk_score
    risk.risk_level = risk_data.risk_level
    risk.ml_score = risk_data.ml_score
    risk.rule_score = risk_data.rule_score

    db.commit()
    db.refresh(risk)

    return risk


def delete_risk(risk_id: int, db: Session):
    risk = get_risk(risk_id, db)

    if not risk:
        return False

    db.delete(risk)
    db.commit()

    return True