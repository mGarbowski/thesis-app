"""Database session handling."""

from typing import Any, AsyncGenerator

from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine
from sqlalchemy.orm import sessionmaker

from app.config import settings

engine = create_async_engine(
    settings.database_url, echo=settings.enable_sqlalchemy_logging
)
async_session = sessionmaker(engine, class_=AsyncSession)  # type: ignore


async def get_db() -> AsyncGenerator[AsyncSession, Any]:
    """Generator yielding an asynchronous database session.

    Database operations must be awaited.
    This generator handles db session cleanup after use.
    """

    async with async_session() as session:  # type: ignore
        yield session
