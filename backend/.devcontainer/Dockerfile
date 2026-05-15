# Dockerfile

# Get the base image
FROM python:3.11-bullseye

# Apt update
RUN apt update

# Install git
RUN apt install -y git

# Install uv
COPY --from=ghcr.io/astral-sh/uv:latest /uv /uvx /usr/local/bin/

# Keeps Python from generating .pyc files in the container
ENV PYTHONDONTWRITEBYTECODE=1

# Turns off buffering for easier container logging
ENV PYTHONUNBUFFERED=1

# Tell uv to use the system Python instead of downloading its own
ENV UV_SYSTEM_PYTHON=1

# Install claude code
RUN curl -fsSL https://claude.ai/install.sh | bash

# Set the path for the local bin
ENV PATH="/root/.local/bin:$PATH"