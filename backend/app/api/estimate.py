from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from app.services.routing_service import get_route

router = APIRouter(prefix="/api", tags=["Estimate"])

BIKE_MULTIPLIER = 0.45
BASE_PRICE_PER_KM = 8000


class Coordinates(BaseModel):
    lat: float
    lng: float


class EstimateRequest(BaseModel):
    pickup: Coordinates
    dropoff: Coordinates
    vehicle_type: str  # "bike" | "car"


@router.post("/estimate")
def estimate(req: EstimateRequest):
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

    base_car_price = int(distance_km * BASE_PRICE_PER_KM)

    vehicle = req.vehicle_type.lower()

    if vehicle == "bike":
        price = int(base_car_price * BIKE_MULTIPLIER)
    elif vehicle == "car":
        price = base_car_price
    else:
        raise HTTPException(status_code=400, detail="Invalid vehicle_type")

    return {
        "distance_km": distance_km,
        "traffic_factor": 1,
        "results": [
            {
                "service": "GRAB",
                "vehicle_type": vehicle,
                "estimated_price": price,
                "eta_min": int(duration_min),
                "score": 0,
                "deep_link": ""
            }
        ]
    }
