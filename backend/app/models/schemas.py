from pydantic import BaseModel

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
    price_vnd: int
    traffic_level: str
    deeplink: str

class EstimateResponse(BaseModel):
    best_option: str
    options: list[ProviderEstimate]
