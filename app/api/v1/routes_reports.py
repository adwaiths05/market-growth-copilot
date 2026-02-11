from fastapi import APIRouter

router = APIRouter()

@router.get("/ping")
def reports_ping():
    return {"message": "reports route working"}
