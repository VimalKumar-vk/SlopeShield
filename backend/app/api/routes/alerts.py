from datetime import datetime

from pydantic import (
    BaseModel,
    ConfigDict,
)


# =========================================================
# ALERT BASE
# =========================================================

class AlertBase(BaseModel):

    location_id: int

    risk_assessment_id: int

    message: str

    severity: str

    status: str


# =========================================================
# CREATE
# =========================================================

class AlertCreate(AlertBase):
    pass


# =========================================================
# UPDATE
# =========================================================

class AlertUpdate(AlertBase):
    pass


# =========================================================
# RESPONSE
# =========================================================

class Alert(AlertBase):

    id: int

    created_at: datetime

    model_config = ConfigDict(
        from_attributes=True
    )