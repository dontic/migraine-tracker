# ── Builder stage ─────────────────────────────────────────────────────────────
FROM python:3.11-slim AS builder

WORKDIR /app/backend

# Build-time system deps needed to compile psycopg2 and Pillow from source
RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc \
    libpq-dev \
    libjpeg-dev \
    zlib1g-dev \
    && rm -rf /var/lib/apt/lists/*

COPY --from=ghcr.io/astral-sh/uv:latest /uv /usr/local/bin/uv

ENV UV_COMPILE_BYTECODE=1 \
    UV_LINK_MODE=copy

# Copy only lockfile + manifest first so this layer caches until deps change
COPY pyproject.toml uv.lock ./

RUN uv sync --frozen --no-dev --no-install-project


# ── Runtime stage ──────────────────────────────────────────────────────────────
FROM python:3.11-slim

WORKDIR /app/backend

# Runtime-only system libs (no headers or compilers)
RUN apt-get update && apt-get install -y --no-install-recommends \
    libpq5 \
    libjpeg62-turbo \
    zlib1g \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Bring in the pre-built virtualenv from the builder
COPY --from=builder /app/backend/.venv ./.venv

ENV PATH="/app/backend/.venv/bin:$PATH" \
    PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

EXPOSE 8000

RUN mkdir -p /app/backend/media

VOLUME /app/backend/media
VOLUME /app/backend/django_static

COPY . .

RUN chmod +x /app/backend/docker/entrypoint-django.sh \
    /app/backend/docker/entrypoint-worker.sh \
    /app/backend/docker/entrypoint-beat.sh

ENTRYPOINT ["/app/backend/docker/entrypoint-django.sh"]
