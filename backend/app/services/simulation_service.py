from datetime import datetime

from sqlalchemy.orm import Session

from app.core.constants import RISK_LEVELS
from app.database.models import (
    Location,
    RiskAssessment,
    SimulationRun,
)
from app.schemas.simulation import SimulationCreate
from app.services.alert_service import create_alert


def get_risk_level(score: float) -> str:
    score = max(0.0, min(score, 100.0))

    for level, (min_score, max_score) in RISK_LEVELS.items():
        if min_score <= score <= max_score:
            return level

    return "SEVERE"


def run_simulation(
    simulation: SimulationCreate,
    db: Session,
):
    simulation_run = SimulationRun(
        name=simulation.name,
        rainfall_multiplier=simulation.rainfall_multiplier,
        duration_hours=simulation.duration_hours,
        status="RUNNING",
    )

    db.add(simulation_run)
    db.commit()
    db.refresh(simulation_run)

    locations = db.query(Location).all()

    for location in locations:

        latest_risk = (
            db.query(RiskAssessment)
            .filter(
                RiskAssessment.location_id == location.id
            )
            .order_by(
                RiskAssessment.timestamp.desc()
            )
            .first()
        )

        if latest_risk is None:
            continue

        new_risk_score = (
            latest_risk.risk_score
            * simulation.rainfall_multiplier
        )

        new_risk_score = min(
            new_risk_score,
            100.0,
        )

        new_risk_level = get_risk_level(
            new_risk_score
        )

        new_risk_assessment = RiskAssessment(
            location_id=location.id,
            timestamp=datetime.utcnow(),
            risk_score=new_risk_score,
            risk_level=new_risk_level,
            ml_score=latest_risk.ml_score,
            rule_score=latest_risk.rule_score,
        )

        db.add(new_risk_assessment)
        db.commit()
        db.refresh(new_risk_assessment)

        create_alert(
            location,
            new_risk_assessment,
            db,
        )

    simulation_run.status = "COMPLETED"

    db.commit()
    db.refresh(simulation_run)

    return simulation_run


def get_simulation_history(db: Session):
    return (
        db.query(SimulationRun)
        .order_by(
            SimulationRun.created_at.desc()
        )
        .all()
    )


def reset_simulation(db: Session):
    latest_simulation = (
        db.query(SimulationRun)
        .order_by(
            SimulationRun.created_at.desc()
        )
        .first()
    )

    if latest_simulation is None:
        latest_simulation = SimulationRun(
            name="Simulation Reset",
            rainfall_multiplier=1.0,
            duration_hours=0,
            status="RESET",
        )

        db.add(latest_simulation)

    else:
        latest_simulation.status = "RESET"

    db.commit()
    db.refresh(latest_simulation)

    return latest_simulation