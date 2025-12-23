from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from app.services.routing_service import get_route
from app.services.pricing_service import calculate_price
from app.utils.traffic import get_traffic
from app.core.constants import PROVIDERS

router = APIRouter(prefix="/api", tags=["Estimate"])

# Multiplier to derive Bike price from Car price
BIKE_MULTIPLIER = 0.45 

class Coordinates(BaseModel):
    lat: float
    lng: float

class EstimateRequest(BaseModel):
    pickup: Coordinates
    dropoff: Coordinates
    vehicle_type: str  # "bike" | "car"

@router.post("/estimate")
def estimate(req: EstimateRequest):
    # 1. Get Route (Distance & Duration)
    try:
        route = get_route(
            req.pickup.lat,
            req.pickup.lng,
            req.dropoff.lat,
            req.dropoff.lng
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Routing failed: {e}")

    distance_km = route["distance_km"]
    duration_min = route["duration_min"]
    route_geometry = route.get("route_geometry", "")

    # 2. Get Real-time Traffic Factor
    traffic_level, traffic_factor = get_traffic()

    # 3. Calculate Price for ALL Providers
    vehicle_type = req.vehicle_type.lower()
    results = []

    for provider_key, config in PROVIDERS.items():
        
        # Calculate base price (Car price)
        base_price = calculate_price(
            provider_key,
            distance_km,
            duration_min,
            traffic_factor
        )

        # Apply discount if the user selected "Bike"
        final_price = base_price
        if vehicle_type == "bike":
            final_price = int(base_price * BIKE_MULTIPLIER)

        results.append({
            "service": provider_key.upper(), # Returns "GRAB", "BE", "XANH_SM"
            "vehicle_type": vehicle_type,
            "estimated_price": final_price,
            "eta_min": int(duration_min),
            "score": 0, 
            "deep_link": config.get("deeplink", "")
        })

    # 4. Sort by price (lowest first)
    results.sort(key=lambda x: x["estimated_price"])

    return {
        "distance_km": distance_km,
        "traffic_factor": traffic_factor,
        "route_geometry": route_geometry,
        "results": results
    }