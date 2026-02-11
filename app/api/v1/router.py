from fastapi import APIRouter
from app.api.v1.routes_analysis import router as analysis_router
from app.api.v1.routes_reports import router as reports_router
from app.api.v1.routes_metrics import router as metrics_router

api_router = APIRouter()

api_router.include_router(analysis_router, prefix="/analysis", tags=["analysis"])
api_router.include_router(reports_router, prefix="/reports", tags=["reports"])
api_router.include_router(metrics_router, prefix="/metrics", tags=["metrics"])
