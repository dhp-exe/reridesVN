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
    return {
        "distance_km": round(distance, 2),
        "duration_min": round(duration, 1),
        "route_geometry": None
    }


# ---------- Real API (OpenRouteService) ----------
ORS_URL = "https://api.openrouteservice.org/v2/directions/driving-car"

def get_route(p_lat, p_lng, d_lat, d_lng):
    headers = {
        "Authorization": ORS_API_KEY,
        "Content-Type": "application/json"
    }

    body = {
        "coordinates": [
            [p_lng, p_lat],
            [d_lng, d_lat]
        ]
    }

    try:
        r = requests.post(ORS_URL, json=body, headers=headers, timeout=10)

        if r.status_code != 200:
            print(f"ORS error {r.status_code}: {r.text}") 
            raise Exception(f"ORS error {r.status_code}")

        data = r.json()

        route_data = data["routes"][0]
        
        summary = route_data["summary"]
        distance_km = summary["distance"] / 1000
        duration_min = summary["duration"] / 60
        
        geometry = route_data.get("geometry", "") 
        return {
            "distance_km": round(distance_km, 2),
            "duration_min": round(duration_min),
            "route_geometry": geometry 
        }

    except KeyError as e:
        print(f"Routing data parsing failed: {e}")
        raise Exception(f"Routing failed: {e}")
    except Exception as e:
        raise e