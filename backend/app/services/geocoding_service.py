import requests
import sqlite3
from app.core.config import OPENMAP_API_KEY
from app.core.database import get_db_connection

# OpenMap.vn Base URL
OM_BASE_URL = "https://mapapis.openmap.vn/v1"

# --- Helper Functions for Caching ---
def normalize_address(address: str) -> str:
    """Standardizes address string to improve cache hits."""
    return address.lower().strip()

def get_coords_from_cache(address: str):
    """Checks SQLite database for cached coordinates."""
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        clean_addr = normalize_address(address)
        cursor.execute("SELECT lat, lng FROM geocode_cache WHERE address = ?", (clean_addr,))
        row = cursor.fetchone()
        
        conn.close()
        
        if row:
            print(f"Cache Hit: {address}")
            return float(row['lat']), float(row['lng'])
    except Exception as e:
        print(f"Cache Read Error: {e}")
    
    return None

def save_to_cache(address: str, lat: float, lng: float):
    """Saves new coordinates to SQLite database."""
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        clean_addr = normalize_address(address)
        # INSERT OR REPLACE updates the timestamp if the address already exists
        cursor.execute(
            "INSERT OR REPLACE INTO geocode_cache (address, lat, lng) VALUES (?, ?, ?)",
            (clean_addr, lat, lng)
        )
        
        conn.commit()
        conn.close()
        print(f"Saved to Cache: {address}")
    except Exception as e:
        print(f"DB Save Error: {e}")

# --- Main Geocoding Function ---

def geocode_address(address: str) -> tuple[float, float]:
    """
    Converts an address string into (lat, lng).
    1. Checks Cache (SQLite)
    2. Calls OpenMap.vn API
    3. Saves result to Cache
    """
    if not address:
        return 0.0, 0.0

    # 1. CHECK CACHE FIRST
    cached = get_coords_from_cache(address)
    if cached:
        return cached

    # 2. CALL API (If not in cache)
    if not OPENMAP_API_KEY:
        print("Warning: OPENMAP_API_KEY is missing.")
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

        if "results" in data and len(data["results"]) > 0:
            location = data["results"][0]["geometry"]["location"]
            lat, lng = float(location["lat"]), float(location["lng"])
            
            # 3. SAVE TO CACHE
            save_to_cache(address, lat, lng)
            
            return lat, lng

        print(f"No coordinates found for: {address}")
        return 0.0, 0.0

    except Exception as e:
        print(f"OpenMap Geocode Error: {e}")
        return 0.0, 0.0

def search_places(query: str):
    """
    Returns a list of address suggestions using OpenMap.vn Autocomplete.
    (Autocomplete is typically not cached due to partial inputs)
    """
    if not query or len(query) < 2 or not OPENMAP_API_KEY:
        return []

    url = f"{OM_BASE_URL}/autocomplete"

    try:
        response = requests.get(
            url,
            params={
                "apikey": OPENMAP_API_KEY,
                "input": query
            },
            timeout=3
        )
        
        if response.status_code == 200:
            data = response.json()
            if "predictions" in data:
                return [item["description"] for item in data["predictions"]]
            
    except Exception as e:
        print(f"OpenMap Autocomplete Error: {e}")
    
    return []