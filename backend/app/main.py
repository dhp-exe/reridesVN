from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api import estimate, geocode
from app.core.database import init_db 

app = FastAPI()

# Initialize Database on Startup
@app.on_event("startup")
def startup_event():
    init_db()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(estimate.router)
app.include_router(geocode.router)