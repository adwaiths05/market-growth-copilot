# app/main.py
from datetime import datetime, timezone
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.v1.router import api_router
from app.core.config import settings

app = FastAPI(
    title=settings.APP_NAME,
    version="0.1.0",
    debug=settings.DEBUG
)

# Configure CORS for local development and production
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"], # Update this to your frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
@app.get("/")
async def root():
    return {
        "message": "Marketplace Growth Copilot API is Online",
        "docs": "/docs",
        "version": "1.0.0"
    }
@app.get("/ping")
async def ping():
    return {"status": "online"}
@app.get("/health")
def health_check():
    return {"status": "healthy", "timestamp": datetime.now(timezone.utc).isoformat().replace("+00:00", "Z"), "app": settings.APP_NAME}

app.include_router(api_router, prefix="/api/v1")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)