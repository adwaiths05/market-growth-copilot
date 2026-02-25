# [File: app/db/session.py]
import os
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from dotenv import load_dotenv

load_dotenv()
DATABASE_URL = os.getenv("DATABASE_URL")

engine = create_async_engine(
    DATABASE_URL, 
    pool_pre_ping=True,
    pool_recycle=300,
    # This handles the SSL cleanly now that the URL is stripped of parameters
    connect_args={
        "ssl": "require",
        "server_settings": {"jit": "off"},
        "command_timeout": 60,
    }
)

AsyncSessionLocal = async_sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False
)