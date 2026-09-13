from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.schemas import Simulation, SimulationCreate, SimulationUpdate
from app.services import simulation_service

router = APIRouter()

@router.post("/simulation/run", response_model=Simulation)
def run_simulation(simulation_create: SimulationCreate, db: Session = Depends(get_db)):
    return simulation_service.run_simulation(simulation_create, db)

@router.get("/simulation/history", response_model=list[Simulation])
def get_simulation_history(db: Session = Depends(get_db)):
    return simulation_service.get_simulation_history(db)

@router.post("/simulation/reset", response_model=Simulation)
def reset_simulation(db: Session = Depends(get_db)):
    return simulation_service.reset_simulation(db)
