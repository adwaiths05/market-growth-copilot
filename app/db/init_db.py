from sqlalchemy import text
from app.db.session import engine
from app.db.base import Base
# Import all models here so SQLAlchemy detects them
from app.models.job_models import Job
from app.models.vector_models import ProductEmbedding

def init_db():
    with engine.connect() as conn:
        conn.execute(text("CREATE EXTENSION IF NOT EXISTS vector"))
        conn.commit()
    Base.metadata.create_all(bind=engine)