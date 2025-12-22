import requests
from app.core.config import ORS_API_KEY

ORS_GEOCODE_URL = "https://api.openrouteservice.org/geocode/search"

def geocode_address(address: str) -> tuple[float, float]:
    response = requests.get(
        ORS_GEOCODE_URL,
        params={
            "text": address,
            "size": 1
        },
        headers={
            "Authorization": ORS_API_KEY
        }
    )

    response.raise_for_status()
    data = response.json()

    coords = data["features"][0]["geometry"]["coordinates"]
    lng, lat = coords
    return lat, lng
