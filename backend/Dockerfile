FROM python:3.12-slim

WORKDIR /srv

COPY --from=ghcr.io/astral-sh/uv:latest /uv /uvx /bin/

COPY pyproject.toml pyproject.toml
COPY uv.lock uv.lock
COPY logging_config.yml logging_config.yml

# Use Docker cache mount to share uv cache across builds
RUN --mount=type=cache,target=/root/.cache/uv \
    uv sync --frozen --no-dev

COPY app app

# Set environment to use the venv created by uv sync
ENV VIRTUAL_ENV=/srv/.venv
ENV PATH="/srv/.venv/bin:$PATH"

# Run directly with uvicorn (no uv run needed since venv is activated)
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000", "--log-config", "logging_config.yml"]