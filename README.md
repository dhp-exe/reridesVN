# ReRides VN 🛵🚗

ReRides VN is a ride-hailing aggregator application for Vietnam. It allows users to instantly compare prices and estimated arrival times (ETAs) across major platforms like Grab, Be, and Xanh SM for both Bike and Car services.

## ✨ Features

**Multi-Provider Comparison:** Compare estimated fares from Grab, Be, and Xanh SM in one view.

**Vehicle Options:** Switch easily between **Bike** and **Car** options.

**Smart Location Search:** - Powered by **OpenMap.vn** for accurate Vietnamese address autocomplete and geocoding.
- Supports "search as you type" for local landmarks and addresses.

**Real-time Estimates:**
- Calculates routes and distances via **OpenRouteService API**.
- Adjusts pricing based on dynamic traffic factors (Rush Hour detection).

**Smart Ranking:** Automatically highlights the "Best Choice" based on the most time-cost-effective ride.

**Deep Linking:** One-click booking that opens the specific ride details directly in the provider's mobile app.

**Responsive UI:** Modern, mobile-first design using Tailwind CSS.

## 🛠️ Tech Stack

### Frontend
- **Framework:** React (Vite)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **State Management:** React Hooks

### Backend
- **Framework:** FastAPI (Python)
- **Routing Engine:** OpenRouteService API (for distance & duration)
- **Geocoding Engine:** OpenMap.vn API (for autocomplete & coordinates)
- **Utilities:** pydantic for validation, python-dotenv for configuration.

## 🚀 Running the project

Follow these instructions to run the project locally.

### Prerequisites
- **Node.js** (v18+ recommended)
- **Python** (v3.9+)
- **OpenRouteService API Key:** Get a free key from [openrouteservice.org](https://openrouteservice.org/).
- **OpenMap.vn API Key:** Get a free key from [openmap.vn](https://openmap.vn/).

### 1. Backend Setup

The backend handles routing calculations, geocoding, and price estimations.

Navigate to the backend directory:
```bash
cd backend
```
Create a virtual environment (optional but recommended):

```
python -m venv venv

# Windows
venv\Scripts\activate
# macOS/Linux
source venv/bin/activate
```
Install dependencies:

```
pip install -r requirements.txt
```
Configure Environment Variables: Create a .env file in the backend folder and add your API key:

```
# Routing (Distance/Duration)
ORS_API_KEY=your_openrouteservice_api_key_here

# Geocoding & Autocomplete
OPENMAP_API_KEY=your_openmap_api_key_here
```
Start the server:

```
uvicorn app.main:app --reload
```
The API will be available at http://localhost:8000.

2. Frontend Setup
Navigate to the frontend directory:

```
cd frontend
```
Install dependencies:

```
npm install
```
Note on Mock Mode: By default, the frontend might be set to use mock data for development. To use the real Python backend:

Open ```src/services/estimateService.ts.```

Set ```const USE_MOCK = false;```

Ensure your ```vite.config.ts``` proxies ```/api``` requests to ```http://localhost:8000```(or configure CORS on the backend).

Run the development server:

```
npm run dev
```
Open your browser at http://localhost:5173.

## ⚙️ Configuration
Pricing Logic
You can adjust the base fares and per-km rates in backend/app/core/constants.py:

```Python

PROVIDERS = {
    "grab": { "base_fare": 12000, "per_km": 4500, ... },
    "be":   { "base_fare": 10000, "per_km": 4300, ... },
    ...
}
```
Traffic Logic
Traffic multipliers are defined in ```backend/app/utils/traffic.py``` based on the time of day (e.g., heavy traffic between 7-9 AM and 4-7 PM).

## 📱 Deep Links
The app generates deep links to open the provider apps directly:

Grab: ```grab://open?screenType=BOOKING...```

Be: ```be://booking...```

Xanh SM: ```xanhsm://booking...```

(Note: Deep links work best when testing on a mobile device with the respective apps installed.)

## 📄 License
[Mb] Project is open source.