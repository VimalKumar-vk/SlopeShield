from sqlalchemy.orm import Session

from app.database.models import (
    Alert as AlertModel,
    Location,
    RiskAssessment,
)


def create_alert(
    location: Location,
    risk_assessment: RiskAssessment,
    db: Session,
):
    if risk_assessment.risk_score < 51:
        return None

    severity = (
        "SEVERE"
        if risk_assessment.risk_score >= 76
        else "HIGH"
    )

    alert = AlertModel(
        location_id=location.id,
        risk_assessment_id=risk_assessment.id,
        message=f"High risk area: {location.name}",
        severity=severity,
        status="ACTIVE",
    )

    db.add(alert)
    db.commit()
    db.refresh(alert)

    return alert


def get_alerts(db: Session):
    return (
        db.query(AlertModel)
        .order_by(AlertModel.created_at.desc())
        .all()
    )


def get_active_alerts(db: Session):
    return (
        db.query(AlertModel)
        .filter(AlertModel.status == "ACTIVE")
        .order_by(AlertModel.created_at.desc())
        .all()
    )


def acknowledge_alert(alert_id: int, db: Session):
    alert = (
        db.query(AlertModel)
        .filter(AlertModel.id == alert_id)
        .first()
    )

    if alert is None:
        return None

    alert.status = "ACKNOWLEDGED"

    db.commit()
    db.refresh(alert)

    return alert