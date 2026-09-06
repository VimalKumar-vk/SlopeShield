from datetime import datetime

from sqlalchemy import Column, DateTime, Float, ForeignKey, Integer, String
from sqlalchemy.orm import relationship

from app.database.base import Base


class Location(Base):
    __tablename__ = "locations"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True, nullable=False)
    district = Column(String, index=True, nullable=False)
    state = Column(String, index=True, nullable=False)

    latitude = Column(Float, index=True, nullable=False)
    longitude = Column(Float, index=True, nullable=False)

    elevation = Column(Float, index=True)
    slope = Column(Float, index=True)
    distance_to_road = Column(Float, index=True)
    distance_to_river = Column(Float, index=True)

    environmental_readings = relationship(
        "EnvironmentalReading",
        back_populates="location",
        cascade="all, delete-orphan",
        order_by="EnvironmentalReading.timestamp",
    )

    risk_assessments = relationship(
        "RiskAssessment",
        back_populates="location",
        cascade="all, delete-orphan",
    )

    alerts = relationship(
        "Alert",
        back_populates="location",
        cascade="all, delete-orphan",
    )


class EnvironmentalReading(Base):
    __tablename__ = "environmental_readings"

    id = Column(Integer, primary_key=True, index=True)

    location_id = Column(
        Integer,
        ForeignKey("locations.id"),
        nullable=False,
        index=True,
    )

    timestamp = Column(
        DateTime,
        default=datetime.utcnow,
        nullable=False,
        index=True,
    )

    rainfall_24h = Column(Float, nullable=False)
    rainfall_72h = Column(Float, nullable=False)
    soil_moisture = Column(Float, nullable=False)
    vegetation_index = Column(Float, nullable=False)

    location = relationship(
        "Location",
        back_populates="environmental_readings",
    )


class RiskAssessment(Base):
    __tablename__ = "risk_assessments"

    id = Column(Integer, primary_key=True, index=True)

    location_id = Column(
        Integer,
        ForeignKey("locations.id"),
        nullable=False,
        index=True,
    )

    timestamp = Column(
        DateTime,
        default=datetime.utcnow,
        nullable=False,
        index=True,
    )

    risk_score = Column(Float, nullable=False, index=True)
    risk_level = Column(String, nullable=False, index=True)

    ml_score = Column(Float, nullable=False)
    rule_score = Column(Float, nullable=False)

    location = relationship(
        "Location",
        back_populates="risk_assessments",
    )

    alerts = relationship(
        "Alert",
        back_populates="risk_assessment",
    )


class Alert(Base):
    __tablename__ = "alerts"

    id = Column(Integer, primary_key=True, index=True)

    location_id = Column(
        Integer,
        ForeignKey("locations.id"),
        nullable=False,
        index=True,
    )

    risk_assessment_id = Column(
        Integer,
        ForeignKey("risk_assessments.id"),
        nullable=False,
        index=True,
    )

    message = Column(String, nullable=False)
    severity = Column(String, nullable=False, index=True)
    status = Column(String, nullable=False, index=True)

    created_at = Column(
        DateTime,
        default=datetime.utcnow,
        nullable=False,
        index=True,
    )

    location = relationship(
        "Location",
        back_populates="alerts",
    )

    risk_assessment = relationship(
        "RiskAssessment",
        back_populates="alerts",
    )


class SimulationRun(Base):
    __tablename__ = "simulation_runs"

    id = Column(Integer, primary_key=True, index=True)

    name = Column(String, nullable=False, index=True)
    rainfall_multiplier = Column(Float, nullable=False)
    duration_hours = Column(Float, nullable=False)

    status = Column(String, nullable=False, index=True)

    created_at = Column(
        DateTime,
        default=datetime.utcnow,
        nullable=False,
        index=True,
    )