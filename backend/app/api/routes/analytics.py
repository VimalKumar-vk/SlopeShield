from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.schemas.analytics import (
    AnalyticsOverview,
    RiskDistribution,
    RiskTrends,
)
from app.services import analytics_service


router = APIRouter()


@router.get(
    "/analytics/overview",
    response_model=AnalyticsOverview,
)
def get_analytics_overview(
    db: Session = Depends(get_db),
):
    return analytics_service.get_overview(db)


@router.get(
    "/analytics/risk-distribution",
    response_model=RiskDistribution,
)
def get_analytics_risk_distribution(
    db: Session = Depends(get_db),
):
    return analytics_service.get_risk_distribution(db)


@router.get(
    "/analytics/risk-trends",
    response_model=RiskTrends,
)
def get_analytics_risk_trends(
    db: Session = Depends(get_db),
):
    return analytics_service.get_risk_trends(db)