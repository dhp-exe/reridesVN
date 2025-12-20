from app.core.constants import PROVIDERS

def calculate_price(provider: str, distance_km: float, duration_min: float, surge: float):
    cfg = PROVIDERS[provider]

    price = (
        cfg["base_fare"]
        + distance_km * cfg["per_km"]
        + duration_min * cfg["per_min"]
    ) * surge

    return int(price)
