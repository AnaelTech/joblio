#!/bin/sh
set -e

echo "Setting up permissions..."
chown -R joblio:joblio /app/dist/client/uploads

echo "Running database migrations..."
su -c "node /app/node_modules/drizzle-kit/bin.cjs migrate --config=/app/drizzle.config.ts" joblio || true
echo "Syncing schema..."
su -c "node /app/node_modules/drizzle-kit/bin.cjs push --config=/app/drizzle.config.ts" joblio

echo "Starting Joblio..."
exec su -c "exec node /app/dist/server/entry.mjs" joblio
