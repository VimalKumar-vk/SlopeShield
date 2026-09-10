from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.schemas import Alert
from app.services import alert_service


router = APIRouter()


# =========================================================
# GET ALL ALERTS
# =========================================================

@router.get(
    "/alerts",
    response_model=list[Alert],
)
def get_alerts(
    db: Session = Depends(get_db),
):
    return alert_service.get_alerts(db)


# =========================================================
# GET ACTIVE ALERTS
# =========================================================

@router.get(
    "/alerts/active",
    response_model=list[Alert],
)
def get_active_alerts(
    db: Session = Depends(get_db),
):
    return alert_service.get_active_alerts(db)


# =========================================================
# GET SINGLE ALERT
# =========================================================

@router.get(
    "/alerts/{alert_id}",
    response_model=Alert,
)
def get_alert(
    alert_id: int,
    db: Session = Depends(get_db),
):
    alert = alert_service.get_alert(
        alert_id,
        db,
    )

    if alert is None:
        raise HTTPException(
            status_code=404,
            detail="Alert not found",
        )

    return alert


# =========================================================
# ACKNOWLEDGE ALERT
# =========================================================

@router.post(
    "/alerts/{alert_id}/acknowledge",
    response_model=Alert,
)
def acknowledge_alert(
    alert_id: int,
    db: Session = Depends(get_db),
):
    alert = alert_service.acknowledge_alert(
        alert_id,
        db,
    )

    if alert is None:
        raise HTTPException(
            status_code=404,
            detail="Alert not found",
        )

    return alert


# =========================================================
# RESOLVE ALERT
# =========================================================

@router.post(
    "/alerts/{alert_id}/resolve",
    response_model=Alert,
)
def resolve_alert(
    alert_id: int,
    db: Session = Depends(get_db),
):
    alert = alert_service.resolve_alert(
        alert_id,
        db,
    )

    if alert is None:
        raise HTTPException(
            status_code=404,
            detail="Alert not found",
        )

    return alert