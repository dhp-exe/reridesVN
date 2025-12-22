# ReRides VN 🛵🚗

ReRides VN is a ride-hailing aggregator application for Vietnam. It allows users to instantly compare prices and estimated arrival times (ETAs) across major platforms—Grab, Be, and Xanh SM—for both Bike and Car services.

## ✨ Features

**Multi-Provider Comparison:** Compare estimated fares from Grab, Be, and Xanh SM in one view.

**Vehicle Options:** Switch easily between Bike (Motorbike) and Car (4-seater) options.

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