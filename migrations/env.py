import asyncio
from logging.config import fileConfig

from sqlalchemy import pool
from sqlalchemy.engine import Connection
from sqlalchemy.ext.asyncio import async_engine_from_config

from alembic import context

# Import your app-specific logic
from app.core.config import settings
from app.db.base import Base
from app.models.job_models import Job
from app.models.vector_models import ProductEmbedding

config = context.config

if config.config_file_name is not None:
    fileConfig(config.config_file_name)

target_metadata = Base.metadata

def do_run_migrations(connection: Connection) -> None:
    """Helper to run the migrations in a synchronous context."""
    context.configure(connection=connection, target_metadata=target_metadata)
    with context.begin_transaction():
        context.run_migrations()

async def run_async_migrations() -> None:
    """In 'online' mode, create an async engine and run migrations."""
    
    # 1. Prepare configuration
    configuration = config.get_section(config.config_ini_section) or {}
    
    # 2. Inject and sanitize the DATABASE_URL
    url = settings.DATABASE_URL
    configuration["sqlalchemy.url"] = url

    # 3. Create Async Engine with the 'channel_binding' fix
    connectable = async_engine_from_config(
    configuration,
    prefix="sqlalchemy.",
    poolclass=pool.NullPool,
    connect_args={
        "ssl": True,
        "server_settings": {"jit": "off"},
        "command_timeout": 60,
    },
)

    # 4. Use run_sync to execute the synchronous Alembic code
    async with connectable.connect() as connection:
        # This helper allows sync Alembic to run on an async connection
        await connection.run_sync(do_run_migrations)

    await connectable.dispose()

def run_migrations_online() -> None:
    """Run migrations in 'online' mode."""
    asyncio.run(run_async_migrations())

def run_migrations_offline() -> None:
    """Run migrations in 'offline' mode."""
    url = settings.DATABASE_URL
    if "sslmode=" in url:
        url = url.replace("sslmode=require", "ssl=require")
    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
    )
    with context.begin_transaction():
        context.run_migrations()

if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()