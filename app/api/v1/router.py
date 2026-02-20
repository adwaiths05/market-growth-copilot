# app/api/v1/router.py
from fastapi import APIRouter
from app.api.v1 import routes_analysis, routes_metrics # Import metrics

api_router = APIRouter()

api_router.include_router(
    routes_analysis.router, 
    prefix="/analysis", 
    tags=["analysis"]
)

api_router.include_router(
    routes_metrics.router, 
    prefix="/metrics", 
    tags=["observability"]
)