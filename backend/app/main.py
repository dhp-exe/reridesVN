from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api import estimate, geocode

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"]
)
app.include_router(estimate.router)
app.include_router(geocode.router)
