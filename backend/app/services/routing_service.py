import math
import requests
from app.core.config import ORS_API_KEY, ORS_BASE_URL

# ---------- Fallback (NO API) ----------
def haversine_km(lat1, lon1, lat2, lon2):
    R = 6371
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)

    a = (
        math.sin(dlat / 2) ** 2
        + math.cos(math.radians(lat1))
        * math.cos(math.radians(lat2))
        * math.sin(dlon / 2) ** 2
    )
    return R * 2 * math.asin(math.sqrt(a))


def estimate_duration(distance_km, traffic_multiplier):
    base_speed_kmh = 30
    speed = base_speed_kmh / traffic_multiplier
    return (distance_km / speed) * 60


def get_route_fallback(pickup, destination, traffic_multiplier):
    distance = haversine_km(
        pickup.lat, pickup.lng,
        destination.lat, destination.lng
    )
    duration = estimate_duration(distance, traffic_multiplier)
    return round(distance, 2), round(duration, 1)


# ---------- Real API (OpenRouteService) ----------
def get_route(pickup, destination, traffic_multiplier):
    if not ORS_API_KEY:
        raise RuntimeError("ORS_API_KEY not set")

    headers = {
        "Authorization": ORS_API_KEY,
        "Content-Type": "application/json"
    }

    body = {
        "coordinates": [
            [pickup.lng, pickup.lat],
            [destination.lng, destination.lat]
        ]
    }

    url = f"{ORS_BASE_URL}/driving-car"

    response = requests.post(url, json=body, headers=headers, timeout=10)
    response.raise_for_status()

    data = response.json()
    summary = data["features"][0]["properties"]["summary"]

    distance_km = summary["distance"] / 1000
    duration_min = (summary["duration"] / 60) * traffic_multiplier

    return round(distance_km, 2), round(duration_min, 1)
