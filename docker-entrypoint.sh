#!/bin/sh
set -e

echo "Running database migrations..."
node /app/node_modules/drizzle-kit/bin.cjs migrate --config=/app/drizzle.config.ts

echo "Starting Joblio..."
exec node /app/dist/server/entry.mjs
