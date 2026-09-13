from fastapi import APIRouter, HTTPException
import requests

router = APIRouter()


@router.get("/geocode")
def search_location(q: str):
    if not q.strip():
        raise HTTPException(
            status_code=400,
            detail="Location query is required"
        )

    url = "https://nominatim.openstreetmap.org/search"

    params = {
        "q": q,
        "format": "json",
        "limit": 10,
        "addressdetails": 1,
    }

    headers = {
        "User-Agent": "SlopeShield/1.0"
    }

    try:
        response = requests.get(
            url,
            params=params,
            headers=headers,
            timeout=10,
        )

        response.raise_for_status()

        results = response.json()

        locations = []

        for item in results:
            locations.append({
                "name": item.get("display_name"),
                "latitude": float(item["lat"]),
                "longitude": float(item["lon"]),
                "type": item.get("type"),
                "address": item.get("address", {}),
            })

        return locations

    except requests.RequestException as exc:
        raise HTTPException(
            status_code=502,
            detail="Location search service unavailable",
        ) from exc