# Dev container Dockerfile

# Get the node 22 alpine image
FROM node:22-bullseye AS build

# Install git
RUN apt update && apt install -y git

# Install vite globally
RUN npm install -g vite

# Instal typescript globally
RUN npm install -g typescript

# Install claude code
RUN curl -fsSL https://claude.ai/install.sh | bash

# Set the path for the local bin
ENV PATH="/root/.local/bin:$PATH"