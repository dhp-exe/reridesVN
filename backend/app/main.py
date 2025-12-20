from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.estimate import router as estimate_router

app = FastAPI(title="ReRidesVN API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # later restrict
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(estimate_router, prefix="/api")
