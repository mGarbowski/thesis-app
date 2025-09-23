from typing import Any, AsyncGenerator

from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker

from app.config import settings

engine = create_async_engine(settings.database_url)
async_session = sessionmaker(engine, class_=AsyncSession)


async def get_db() -> AsyncGenerator[Any, Any]:
    async with async_session() as session:
        yield session
