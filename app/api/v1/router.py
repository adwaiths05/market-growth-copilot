from fastapi import APIRouter
from app.api.v1.routes_metrics import router as metrics_router
from app.api.v1.routes_analysis import router as analysis_router

api_router = APIRouter()

# Only include active, functional routers
api_router.include_router(metrics_router, prefix="/analysis", tags=["Marketplace Analysis"])