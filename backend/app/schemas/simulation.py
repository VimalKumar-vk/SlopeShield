from datetime import datetime

from pydantic import BaseModel, ConfigDict


class SimulationBase(BaseModel):
    name: str
    rainfall_multiplier: float
    duration_hours: float
    status: str


class SimulationCreate(SimulationBase):
    pass


class SimulationUpdate(SimulationBase):
    pass


class Simulation(SimulationBase):
    id: int
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)