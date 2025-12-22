from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel
from typing import List
from app.services.geocoding_service import geocode_address, search_places

router = APIRouter(prefix="/api", tags=["Geocode"])

class GeocodeRequest(BaseModel):
    address: str

@router.post("/geocode")
def geocode(req: GeocodeRequest):
    lat, lng = geocode_address(req.address)
    # Optional: Handle 0.0 result as not found
    if lat == 0.0 and lng == 0.0:
         raise HTTPException(status_code=404, detail="Address not found")
    return {"lat": lat, "lng": lng}

@router.get("/autocomplete", response_model=List[str])
def autocomplete(query: str = Query(..., min_length=1)):
    return search_places(query)