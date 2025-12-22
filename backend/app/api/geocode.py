from fastapi import APIRouter
from pydantic import BaseModel
from app.services.geocoding_service import geocode_address

router = APIRouter(prefix="/api", tags=["Geocode"])

class GeocodeRequest(BaseModel):
    address: str

@router.post("/geocode")
def geocode(req: GeocodeRequest):
    lat, lng = geocode_address(req.address)
    return {"lat": lat, "lng": lng}
