import os
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from dotenv import load_dotenv

load_dotenv()

# Ensure the URL uses postgresql+asyncpg://
DATABASE_URL = os.getenv("DATABASE_URL")

# Create Async Engine
engine = create_async_engine(
    DATABASE_URL, 
    pool_pre_ping=True,
    echo=False # Set to True for SQL logging during debugging
)

# Async session factory
AsyncSessionLocal = async_sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autocommit=False,
    autoflush=False
)

async def get_db():
    """Dependency for FastAPI routes to provide an async database session."""
    async with AsyncSessionLocal() as session:
        try:
            yield session
        finally:
            await session.close()