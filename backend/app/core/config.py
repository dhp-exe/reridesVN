import os
from dotenv import load_dotenv

load_dotenv()

ORS_API_KEY = os.getenv("ORS_API_KEY")
ORS_BASE_URL = "https://api.openrouteservice.org/v2/directions"
OPENMAP_API_KEY = os.getenv("OPENMAP_API_KEY", "")
