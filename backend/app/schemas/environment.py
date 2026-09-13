from datetime import datetime

from pydantic import BaseModel, ConfigDict


class EnvironmentalReadingBase(BaseModel):
    location_id: int
    timestamp: datetime
    rainfall_24h: float
    rainfall_72h: float
    soil_moisture: float
    vegetation_index: float


class EnvironmentalReadingCreate(EnvironmentalReadingBase):
    pass


class EnvironmentalReadingUpdate(EnvironmentalReadingBase):
    pass


class EnvironmentalReading(EnvironmentalReadingBase):
    id: int

    model_config = ConfigDict(from_attributes=True)