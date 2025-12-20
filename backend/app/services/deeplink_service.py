from app.core.constants import PROVIDERS

def get_deeplink(provider: str):
    return PROVIDERS[provider]["deeplink"]
