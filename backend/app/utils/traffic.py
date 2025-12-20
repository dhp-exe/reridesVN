from datetime import datetime

def get_traffic():
    hour = datetime.now().hour

    if 7 <= hour <= 9 or 16 <= hour <= 19:
        return "heavy", 1.6
    if 10 <= hour <= 15:
        return "medium", 1.3
    return "light", 1.0
