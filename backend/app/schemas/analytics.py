from pydantic import BaseModel, ConfigDict
from datetime import datetime

class AnalyticsBase(BaseModel):
    pass

class AnalyticsCreate(AnalyticsBase):
    pass

class AnalyticsUpdate(AnalyticsBase):
    pass

class Analytics(AnalyticsBase):
    id: int
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
