from pydantic import BaseModel
from typing import List

class Location(BaseModel):
    lat: float
    lng: float

class EstimateRequest(BaseModel):
    pickup: Location
    destination: Location

class ProviderEstimate(BaseModel):
    provider: str
    distance_km: float
    duration_min: float
    traffic_level: str
    price_vnd: int
    deeplink: str

class EstimateResponse(BaseModel):
    best_option: str
    options: List[ProviderEstimate]
