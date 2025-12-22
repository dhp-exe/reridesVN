import requests
from app.core.config import OPENMAP_API_KEY

# OpenMap.vn Base URL
OM_BASE_URL = "https://mapapis.openmap.vn/v1"

def geocode_address(address: str) -> tuple[float, float]:
    """
    Converts an address string into (lat, lng) using OpenMap.vn Forward Geocoding.
    """
    if not address or not OPENMAP_API_KEY:
        return 0.0, 0.0

    url = f"{OM_BASE_URL}/geocode/forward"
    
    try:
        response = requests.get(
            url,
            params={
                "apikey": OPENMAP_API_KEY,
                "address": address
            },
            timeout=5
        )
        response.raise_for_status()
        data = response.json()

        # OpenMap (Google Format) returns a "results" list
        if "results" in data and len(data["results"]) > 0:
            location = data["results"][0]["geometry"]["location"]
            return float(location["lat"]), float(location["lng"])

        print(f"No coordinates found for: {address}")
        return 0.0, 0.0

    except Exception as e:
        print(f"OpenMap Geocode Error: {e}")
        return 0.0, 0.0


def search_places(query: str):
    """
    Returns a list of address suggestions using OpenMap.vn Autocomplete.
    """
    if not query or len(query) < 2 or not OPENMAP_API_KEY:
        return []

    url = f"{OM_BASE_URL}/autocomplete"

    try:
        response = requests.get(
            url,
            params={
                "apikey": OPENMAP_API_KEY,
                "input": query  # OpenMap uses 'input' for the search text
            },
            timeout=3
        )
        
        if response.status_code == 200:
            data = response.json()
            # OpenMap Autocomplete returns 'predictions' in Google format
            if "predictions" in data:
                # Extract the 'description' (the full address string)
                return [item["description"] for item in data["predictions"]]
            
    except Exception as e:
        print(f"OpenMap Autocomplete Error: {e}")
    
    return []