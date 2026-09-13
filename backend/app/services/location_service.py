from sqlalchemy.orm import Session

from app.database.models import Location


def get_locations(db: Session):
    return db.query(Location).all()


def get_location(location_id: int, db: Session):
    return (
        db.query(Location)
        .filter(Location.id == location_id)
        .first()
    )
