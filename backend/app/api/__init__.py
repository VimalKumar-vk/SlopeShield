from fastapi import APIRouter

from app.api.routes.environment import router as environment_router

from app.api.routes import (
    alerts,
    analytics,
    health,
    locations,
    risk,
    simulation,
)


api_router = APIRouter()
api_router.include_router(
    environment_router,
    tags=["Environmental Readings"],
)
api_router.include_router(
    health.router,
    tags=["Health"],
)

api_router.include_router(
    locations.router,
    tags=["Locations"],
)

api_router.include_router(
    risk.router,
    tags=["Risk Assessment"],
)

api_router.include_router(
    alerts.router,
    tags=["Alerts"],
)

api_router.include_router(
    analytics.router,
    tags=["Analytics"],
)

api_router.include_router(
    simulation.router,
    tags=["Simulation"],
)