from sqlalchemy import text
from app.db.session import engine
from app.db.base import Base
# You must import all models here so SQLAlchemy "sees" them
from app.models.job_models import Job 
from app.models.vector_models import ProductEmbedding

def init_db():
    print("Connecting to Neon to sync schema...")
    with engine.connect() as conn:
        # Enable pgvector extension
        conn.execute(text("CREATE EXTENSION IF NOT EXISTS vector"))
        
        # Drop existing tables to resolve the 'UndefinedColumn' error
        # This is the 'Permanent' fix for a broken schema in early dev
        print("Dropping old tables...")
        conn.execute(text("DROP TABLE IF EXISTS product_embeddings CASCADE"))
        conn.execute(text("DROP TABLE IF EXISTS jobs CASCADE"))
        
        conn.commit()
    
    # Create tables based on your latest models (including product_url)
    print("Creating new tables from latest models...")
    Base.metadata.create_all(bind=engine)
    print("Sync complete. Your database is now permanent and ready.")

if __name__ == "__main__":
    init_db()