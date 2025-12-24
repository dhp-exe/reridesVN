from fastapi import APIRouter, Query
from typing import List, Optional
from app.services.geocoding_service import geocode_address, search_places
from pydantic import BaseModel

router = APIRouter(prefix="/api", tags=["Geocode"])

class GeocodeRequest(BaseModel):
    address: str

@router.post("/geocode")
def get_geocode(req: GeocodeRequest):
    lat, lng = geocode_address(req.address)
    return {"lat": lat, "lng": lng}

@router.get("/autocomplete", response_model=List[str])
def autocomplete(
    query: str, 
    lat: Optional[float] = Query(None), 
    lng: Optional[float] = Query(None)
):
    """
    Search for places, optionally biased by user location (lat, lng).
    """
    return search_places(query, lat, lng)