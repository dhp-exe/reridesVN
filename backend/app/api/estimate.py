from fastapi import APIRouter, HTTPException
from app.models.schemas import (
    EstimateRequest,
    EstimateResponse,
    ProviderEstimate
)
from app.services.routing_service import (
    get_route,
    get_route_fallback
)
from app.services.pricing_service import calculate_price
from app.services.ranking_service import rank_options
from app.services.deeplink_service import get_deeplink
from app.utils.traffic import get_traffic
from app.core.constants import PROVIDERS

router = APIRouter()


@router.post("/estimate", response_model=EstimateResponse)
def estimate(req: EstimateRequest):
    """
    Given pickup & destination:
    - calculate distance & duration
    - estimate price per provider
    - rank best option
    """

    traffic_level, traffic_multiplier = get_traffic()
    options: list[ProviderEstimate] = []

    for provider in PROVIDERS.keys():
        # 1. Routing (real API → fallback)
        try:
            distance_km, duration_min = get_route(
                req.pickup,
                req.destination,
                traffic_multiplier
            )
        except Exception:
            distance_km, duration_min = get_route_fallback(
                req.pickup,
                req.destination,
                traffic_multiplier
            )

        # 2. Pricing
        price_vnd = calculate_price(
            provider,
            distance_km,
            duration_min,
            traffic_multiplier
        )

        # 3. Build response item
        options.append(
            ProviderEstimate(
                provider=provider,
                distance_km=distance_km,
                duration_min=duration_min,
                traffic_level=traffic_level,
                price_vnd=price_vnd,
                deeplink=get_deeplink(provider)
            )
        )

    if not options:
        raise HTTPException(status_code=500, detail="No estimates available")

    # 4. Ranking
    best = rank_options(options)

    return EstimateResponse(
        best_option=best,
        options=options
    )
