from datetime import datetime, timedelta

import requests
import pystac_client
import planetary_computer


STAC_URL = "https://planetarycomputer.microsoft.com/api/stac/v1"
DATA_API_URL = "https://planetarycomputer.microsoft.com/api/data/v1"


def get_vegetation_index(latitude: float, longitude: float):
    """
    Fetch real NDVI for a location using Sentinel-2 L2A
    through Microsoft Planetary Computer's Data API.

    NDVI = (NIR - RED) / (NIR + RED)

    Sentinel-2:
        B04 = Red
        B08 = Near Infrared
    """

    try:
        # ---------------------------------------------------------
        # 1. Connect to Planetary Computer STAC
        # ---------------------------------------------------------
        catalog = pystac_client.Client.open(
            STAC_URL,
            modifier=planetary_computer.sign_inplace,
        )

        # ---------------------------------------------------------
        # 2. Search small area around requested location
        # ---------------------------------------------------------
        delta = 0.01

        bbox = [
            longitude - delta,
            latitude - delta,
            longitude + delta,
            latitude + delta,
        ]

        end_date = datetime.utcnow().date()
        start_date = end_date - timedelta(days=90)

        search = catalog.search(
            collections=["sentinel-2-l2a"],
            bbox=bbox,
            datetime=f"{start_date}/{end_date}",
            query={
                "eo:cloud_cover": {
                    "lt": 40
                }
            },
        )

        # ---------------------------------------------------------
        # 3. Get best/latest available Sentinel-2 item
        # ---------------------------------------------------------
        items = list(search.items())

        if not items:
            print("No Sentinel-2 imagery found.")
            return None

        # Lowest cloud cover first
        items.sort(
            key=lambda item: item.properties.get(
                "eo:cloud_cover",
                100
            )
        )

        item = items[0]

        print(f"Sentinel-2 item selected: {item.id}")
        print(
            "Cloud cover:",
            item.properties.get("eo:cloud_cover")
        )

        # ---------------------------------------------------------
        # 4. Ask Planetary Computer Data API for NDVI directly
        # ---------------------------------------------------------
        url = (
            f"{DATA_API_URL}/item/point/"
            f"{longitude},{latitude}"
        )

        params = [
            ("collection", "sentinel-2-l2a"),
            ("item", item.id),
            ("assets", "B04"),
            ("assets", "B08"),
            ("expression", "(B08-B04)/(B08+B04)"),
            ("asset_as_band", "true"),
            ("nodata", "0"),
        ]

        print("Requesting NDVI from Planetary Computer Data API...")

        response = requests.get(
            url,
            params=params,
            timeout=30,
        )

        print("NDVI API status:", response.status_code)

        response.raise_for_status()

        data = response.json()

        print("NDVI API response:", data)

        # ---------------------------------------------------------
        # 5. Extract value
        # ---------------------------------------------------------
        value = None

        if isinstance(data, dict):

            # Common point-response format
            if "values" in data:
                values = data["values"]

                if isinstance(values, list) and values:
                    value = values[0]

                elif isinstance(values, dict):
                    value = next(
                        iter(values.values()),
                        None
                    )

            # Fallback formats
            elif "value" in data:
                value = data["value"]

            elif "data" in data:
                nested = data["data"]

                if isinstance(nested, list) and nested:
                    value = nested[0]

                elif isinstance(nested, dict):
                    value = next(
                        iter(nested.values()),
                        None
                    )

        if value is None:
            print("Could not extract NDVI value.")
            return None

        # ---------------------------------------------------------
        # 6. Convert to float and validate
        # ---------------------------------------------------------
        ndvi = float(value)

        if ndvi < -1 or ndvi > 1:
            print(f"Invalid NDVI value received: {ndvi}")
            return None

        ndvi = round(ndvi, 4)

        print(f"Real NDVI: {ndvi}")

        return ndvi

    except requests.RequestException as exc:
        print(
            "NDVI Data API request failed:",
            type(exc).__name__,
            exc,
        )
        return None

    except Exception as exc:
        print(
            "NDVI processing failed:",
            type(exc).__name__,
            exc,
        )
        return None