from datetime import datetime

from pydantic import BaseModel, ConfigDict


class RiskBase(BaseModel):
    location_id: int
    timestamp: datetime
    risk_score: float
    risk_level: str
    ml_score: float
    rule_score: float


class RiskCreate(RiskBase):
    pass


class RiskUpdate(RiskBase):
    pass


class Risk(RiskBase):
    id: int

    model_config = ConfigDict(from_attributes=True)