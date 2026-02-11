from app.db.session import engine
from app.db.base import Base
from app.models.job_models import Job

def init_db():
    Base.metadata.create_all(bind=engine)
