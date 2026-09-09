from sqlalchemy.orm import Session

from app.database.models import (
    Alert as AlertModel,
    Location,
    RiskAssessment,
)


# =========================================================
# CREATE ALERT
# =========================================================

def create_alert(
    location: Location,
    risk_assessment: RiskAssessment,
    db: Session,
):
    """
    Automatically create an alert from risk assessment.

    LOW       < 40   -> No alert
    MODERATE  40-69  -> No alert
    HIGH      70-89  -> HIGH alert
    SEVERE    90-100 -> SEVERE alert
    """

    risk_score = float(
        risk_assessment.risk_score or 0
    )

    # -----------------------------------------------------
    # LOW / MODERATE
    # -----------------------------------------------------

    if risk_score < 70:

        return None

    # -----------------------------------------------------
    # DETERMINE SEVERITY
    # -----------------------------------------------------

    if risk_score >= 90:

        severity = "SEVERE"

        message = (
            f"Severe landslide risk detected at "
            f"{location.name}. "
            f"Immediate attention required."
        )

    else:

        severity = "HIGH"

        message = (
            f"High landslide risk detected at "
            f"{location.name}. "
            f"Close monitoring required."
        )

    # -----------------------------------------------------
    # PREVENT DUPLICATE ACTIVE ALERT
    # -----------------------------------------------------
    #
    # Same location + active alert should not create
    # unlimited duplicate alerts.
    #

    existing_alert = (
        db.query(AlertModel)
        .filter(
            AlertModel.location_id == location.id,

            AlertModel.status == "ACTIVE",

            AlertModel.severity == severity,
        )
        .order_by(
            AlertModel.created_at.desc()
        )
        .first()
    )

    if existing_alert:

        # Update message to latest risk

        existing_alert.message = message

        db.commit()

        db.refresh(existing_alert)

        return existing_alert

    # -----------------------------------------------------
    # CREATE NEW ALERT
    # -----------------------------------------------------

    alert = AlertModel(

        location_id=location.id,

        risk_assessment_id=(
            risk_assessment.id
        ),

        message=message,

        severity=severity,

        status="ACTIVE",
    )

    db.add(alert)

    db.commit()

    db.refresh(alert)

    return alert


# =========================================================
# GET ALL ALERTS
# =========================================================

def get_alerts(db: Session):

    return (
        db.query(AlertModel)
        .order_by(
            AlertModel.created_at.desc()
        )
        .all()
    )


# =========================================================
# GET ACTIVE ALERTS
# =========================================================

def get_active_alerts(db: Session):

    return (
        db.query(AlertModel)
        .filter(
            AlertModel.status == "ACTIVE"
        )
        .order_by(
            AlertModel.created_at.desc()
        )
        .all()
    )


# =========================================================
# GET SINGLE ALERT
# =========================================================

def get_alert(
    alert_id: int,
    db: Session,
):

    return (
        db.query(AlertModel)
        .filter(
            AlertModel.id == alert_id
        )
        .first()
    )


# =========================================================
# ACKNOWLEDGE ALERT
# =========================================================

def acknowledge_alert(
    alert_id: int,
    db: Session,
):

    alert = get_alert(
        alert_id,
        db,
    )

    if alert is None:

        return None

    alert.status = "ACKNOWLEDGED"

    db.commit()

    db.refresh(alert)

    return alert


# =========================================================
# RESOLVE ALERT
# =========================================================

def resolve_alert(
    alert_id: int,
    db: Session,
):

    alert = get_alert(
        alert_id,
        db,
    )

    if alert is None:

        return None

    alert.status = "RESOLVED"

    db.commit()

    db.refresh(alert)

    return alert