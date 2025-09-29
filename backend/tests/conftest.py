"""Pytest configuration and fixtures.

Overrides FastAPI dependencies for testing - uses separate database for tests.
"""

import pytest_asyncio
from httpx import ASGITransport, AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine
from sqlalchemy.orm import sessionmaker

from app.db import get_db
from app.db.base import Base
from app.main import app

TEST_DATABASE_URL = (
    "postgresql+asyncpg://postgres:postgres@localhost:5433/face_recognition_test"
)
engine = create_async_engine(TEST_DATABASE_URL, future=True)
async_session = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)


@pytest_asyncio.fixture
async def client():
    """Test client for the FastAPI application."""

    async with AsyncClient(
        transport=ASGITransport(app=app), base_url="http://test"
    ) as client:
        yield client


@pytest_asyncio.fixture
async def clean_db():
    """Fixture to run the test with a clean database.

    Does not apply automatically, must be listed as an argument to the test function.
    """

    async with engine.begin() as conn:
        print("Recreating test db...")
        await conn.run_sync(Base.metadata.drop_all)
        await conn.run_sync(Base.metadata.create_all)
    yield


async def get_test_db():
    """Dependency injector to override the get_db dependency with a test database session."""
    async with async_session() as session:
        yield session
    await engine.dispose()


app.dependency_overrides[get_db] = get_test_db
