FROM python:3.12-slim

WORKDIR /srv

COPY pyproject.toml pyproject.toml
COPY pdm.lock pdm.lock

RUN pip install --no-cache-dir pdm
RUN pdm install --prod --frozen-lockfile

COPY app app

CMD ["pdm", "prod"]