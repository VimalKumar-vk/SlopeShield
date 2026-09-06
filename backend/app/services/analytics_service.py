from sqlalchemy.orm import Session


def get_overview(db: Session):

    return {
        "total_locations": 12,
        "high_risk_locations": 3,
        "critical_locations": 1,
        "active_alerts": 4,
        "average_risk_score": 52.4,
    }


def get_risk_distribution(db: Session):

    return {
        "low": 4,
        "moderate": 4,
        "high": 3,
        "critical": 1,
    }


def get_risk_trends(db: Session):

    return {
        "trends": [
            {
                "date": "2026-09-01",
                "average_risk_score": 35.2,
            },
            {
                "date": "2026-09-02",
                "average_risk_score": 42.8,
            },
            {
                "date": "2026-09-03",
                "average_risk_score": 48.6,
            },
            {
                "date": "2026-09-04",
                "average_risk_score": 56.3,
            },
            {
                "date": "2026-09-05",
                "average_risk_score": 63.1,
            },
            {
                "date": "2026-09-06",
                "average_risk_score": 58.7,
            },
        ]
    }