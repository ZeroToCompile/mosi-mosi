#!/bin/sh
set -eu

echo "Running Better Auth migrate..."
npx --yes auth@latest migrate --yes --config ./dist/auth.js

echo "Seeding admin (if missing)..."
node ./dist/scripts/seed-admin.js

exec node dist/main.js
