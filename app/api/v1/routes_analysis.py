from fastapi import APIRouter

router = APIRouter()

@router.get("/ping")
def analysis_ping():
    return {"message": "analysis route working"}
