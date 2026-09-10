from datetime import datetime

from pydantic import BaseModel, ConfigDict


class AlertBase(BaseModel):
    location_id: int
    risk_assessment_id: int
    message: str
    severity: str
    status: str


class AlertCreate(AlertBase):
    pass


class AlertUpdate(AlertBase):
    pass


class Alert(AlertBase):
    id: int
    created_at: datetime

    model_config = ConfigDict(
        from_attributes=True
    )