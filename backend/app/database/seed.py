from datetime import datetime

from app.database.base import SessionLocal
from app.database.models import (
    Location,
    EnvironmentalReading,
    RiskAssessment,
    Alert,
    SimulationRun,
)

def seed_database():
    db = SessionLocal()
    if not db.query(Location).first():
        locations = [
            Location(name="Guwahati", district="Guwahati", state="Assam", latitude=26.1855, longitude=91.7634, elevation=1100, slope=15, distance_to_road=1000, distance_to_river=500),
            Location(name="Shillong", district="Shillong", state="Meghalaya", latitude=25.5944, longitude=91.8944, elevation=1700, slope=20, distance_to_road=1500, distance_to_river=1000),
            # Add more locations as needed
        ]
        for location in locations:
            db.add(location)
        db.commit()

    if not db.query(EnvironmentalReading).first():
        readings = [
            EnvironmentalReading(location_id=1, timestamp=datetime.utcnow(), rainfall_24h=10, rainfall_72h=20, soil_moisture=30, vegetation_index=40),
            EnvironmentalReading(location_id=2, timestamp=datetime.utcnow(), rainfall_24h=15, rainfall_72h=25, soil_moisture=35, vegetation_index=45),
            # Add more readings as needed
        ]
        for reading in readings:
            db.add(reading)
        db.commit()

    if not db.query(RiskAssessment).first():
        assessments = [
            RiskAssessment(location_id=1, timestamp=datetime.utcnow(), risk_score=30, risk_level="MODERATE", ml_score=20, rule_score=10),
            RiskAssessment(location_id=2, timestamp=datetime.utcnow(), risk_score=40, risk_level="HIGH", ml_score=30, rule_score=10),
            # Add more assessments as needed
        ]
        for assessment in assessments:
            db.add(assessment)
        db.commit()

    if not db.query(Alert).first():
        alerts = [
            Alert(location_id=2, risk_assessment_id=2, message="High risk area", severity="HIGH", status="ACTIVE", created_at=datetime.utcnow()),
            # Add more alerts as needed
        ]
        for alert in alerts:
            db.add(alert)
        db.commit()

    if not db.query(SimulationRun).first():
        simulations = [
            SimulationRun(name="Moderate Rainfall", rainfall_multiplier=1.5, duration_hours=24, status="COMPLETED", created_at=datetime.utcnow()),
            SimulationRun(name="Heavy Rainfall", rainfall_multiplier=2.0, duration_hours=48, status="COMPLETED", created_at=datetime.utcnow()),
            SimulationRun(name="Extreme Rainfall", rainfall_multiplier=2.5, duration_hours=72, status="COMPLETED", created_at=datetime.utcnow()),
            # Add more simulations as needed
        ]
        for simulation in simulations:
            db.add(simulation)
        db.commit()

    db.close()
