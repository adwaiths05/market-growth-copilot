import asyncio
from logging.config import fileConfig

from sqlalchemy import pool
from sqlalchemy.engine import Connection
from sqlalchemy.ext.asyncio import create_async_engine

from alembic import context

# --- PROJECT IMPORTS ---
# Adjusted to match your Marketplace Growth Copilot directory structure
from app.core.config import settings
from app.db.base import Base
# Import models to ensure they are registered on Base.metadata for autogenerate
from app.models.job_models import Job
from app.models.vector_models import ProductEmbedding
# -----------------------

# Alembic Config object
config = context.config

# Interpret the config file for Python logging
if config.config_file_name is not None:
    fileConfig(config.config_file_name)

# Set the metadata for 'autogenerate' support
target_metadata = Base.metadata

def run_migrations_offline() -> None:
    """Run migrations in 'offline' mode."""
    # Pull URL from Pydantic settings
    url = settings.DATABASE_URL
    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
    )

    with context.begin_transaction():
        context.run_migrations()

def do_run_migrations(connection: Connection) -> None:
    """Helper to run migrations in a synchronous context."""
    context.configure(connection=connection, target_metadata=target_metadata)

    with context.begin_transaction():
        context.run_migrations()

async def run_async_migrations() -> None:
    """In 'online' mode, create an async engine and run migrations."""
    
    # Ensure URL uses the correct asyncpg driver prefix
    database_url = settings.DATABASE_URL.replace("postgres://", "postgresql+asyncpg://")
    if "postgresql+asyncpg://" not in database_url:
        database_url = database_url.replace("postgresql://", "postgresql+asyncpg://")

    # Clean the URL of any manual parameters that cause handshake conflicts
    if "?" in database_url:
        database_url = database_url.split("?")[0]

    connectable = create_async_engine(
        database_url,
        poolclass=pool.NullPool,
        connect_args={
            "ssl": True,
            "command_timeout": 60,
            "server_settings": {"jit": "off"} # Recommended for Neon stability
        }
    )

    async with connectable.connect() as connection:
        await connection.run_sync(do_run_migrations)

    await connectable.dispose()

def run_migrations_online() -> None:
    """Run migrations in 'online' mode."""
    try:
        # Check if an event loop is already running (e.g., in a debugger or notebook)
        asyncio.get_running_loop()
        # If running, we cannot use asyncio.run(); we must use the current loop
        asyncio.create_task(run_async_migrations())
    except RuntimeError:
        # No loop is running, safe to use asyncio.run()
        asyncio.run(run_async_migrations())

if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()