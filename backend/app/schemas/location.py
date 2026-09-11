from pydantic import BaseModel, ConfigDict


class LocationBase(BaseModel):
    name: str
    district: str
    state: str

    latitude: float
    longitude: float

    elevation: float | None = None
    slope: float | None = None
    distance_to_road: float | None = None
    distance_to_river: float | None = None


class LocationCreate(LocationBase):
    pass


class LocationUpdate(LocationBase):
    pass


class Location(LocationBase):
    id: int

    model_config = ConfigDict(from_attributes=True)