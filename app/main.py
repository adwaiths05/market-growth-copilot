from fastapi import FastAPI
from app.api.v1.router import api_router

app = FastAPI(
    title="Marketplace Growth Copilot API",
    version="0.1.0"
)

@app.get("/health")
def health_check():
    return {"status": "ok"}

app.include_router(api_router, prefix="/api/v1")
