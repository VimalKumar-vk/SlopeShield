from collections import defaultdict

from sqlalchemy.orm import Session

from app.database.models import (
    Alert,
    Location,
    RiskAssessment,
)


def _get_latest_risks_by_location(db: Session):
    """
    Get the latest risk assessment for each valid location.
    """

    locations = db.query(Location).all()
    valid_location_ids = {location.id for location in locations}

    risks = (
        db.query(RiskAssessment)
        .filter(
            RiskAssessment.location_id.in_(valid_location_ids)
        )
        .order_by(
            RiskAssessment.timestamp.desc()
        )
        .all()
    )

    latest_by_location = {}

    for risk in risks:
        if risk.location_id not in latest_by_location:
            latest_by_location[risk.location_id] = risk

    return latest_by_location


def _get_risk_level(risk_score: float):
    """
    Calculate risk level from the actual risk score.
    """

    if risk_score >= 90:
        return "CRITICAL"

    if risk_score >= 70:
        return "HIGH"

    if risk_score >= 40:
        return "MODERATE"

    return "LOW"


def get_overview(db: Session):

    locations = db.query(Location).all()

    latest_risks = _get_latest_risks_by_location(db)

    risk_scores = [
        float(risk.risk_score or 0)
        for risk in latest_risks.values()
    ]

    average_risk_score = (
        sum(risk_scores) / len(risk_scores)
        if risk_scores
        else 0
    )

    high_risk_locations = 0
    critical_locations = 0

    for risk in latest_risks.values():

        risk_level = _get_risk_level(
            float(risk.risk_score or 0)
        )

        if risk_level == "HIGH":
            high_risk_locations += 1

        elif risk_level == "CRITICAL":
            critical_locations += 1

    active_alerts = (
        db.query(Alert)
        .filter(Alert.status == "ACTIVE")
        .count()
    )

    return {
        "total_locations": len(locations),

        "high_risk_locations": (
            high_risk_locations
            + critical_locations
        ),

        "critical_locations": critical_locations,

        "active_alerts": active_alerts,

        "average_risk_score": round(
            average_risk_score,
            2,
        ),
    }


def get_risk_distribution(db: Session):

    latest_risks = _get_latest_risks_by_location(db)

    distribution = {
        "low": 0,
        "moderate": 0,
        "high": 0,
        "critical": 0,
    }

    for risk in latest_risks.values():

        score = float(
            risk.risk_score or 0
        )

        level = _get_risk_level(score)

        if level == "LOW":
            distribution["low"] += 1

        elif level == "MODERATE":
            distribution["moderate"] += 1

        elif level == "HIGH":
            distribution["high"] += 1

        elif level == "CRITICAL":
            distribution["critical"] += 1

    return distribution


def get_risk_trends(db: Session):

    risks = (
        db.query(RiskAssessment)
        .order_by(
            RiskAssessment.timestamp.asc()
        )
        .all()
    )

    daily_scores = defaultdict(list)

    for risk in risks:

        if risk.timestamp is None:
            continue

        date_key = risk.timestamp.date().isoformat()

        daily_scores[date_key].append(
            float(risk.risk_score or 0)
        )

    trends = []

    for date_key in sorted(daily_scores):

        scores = daily_scores[date_key]

        average_score = (
            sum(scores) / len(scores)
            if scores
            else 0
        )

        trends.append(
            {
                "date": date_key,

                "average_risk_score": round(
                    average_score,
                    2,
                ),
            }
        )

    return {
        "trends": trends
    }