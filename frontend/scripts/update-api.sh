#!/bin/bash
set -e

BACKEND_HOST="${BACKEND_HOST:-django}"
SCHEMA_URL="http://${BACKEND_HOST}:8000/api/schema/"
SCHEMA_PATH="src/api/schemas/django/schema.yaml"

echo "Downloading API schema from $SCHEMA_URL..."
curl -f "$SCHEMA_URL" -o "$SCHEMA_PATH"
echo "Schema saved to $SCHEMA_PATH"

echo "Generating API layer..."
npm run orvalDjango
echo "Done."
