#!/usr/bin/env bash
set -euo pipefail

export PATH="${HOME}/.nvm/versions/node/v22.22.2/bin:${PATH}"
cd /workspace

# Prefer Node 22.22+ (nestjs-better-auth engine)
if command -v node >/dev/null 2>&1; then
  echo "Using node $(node -v) at $(command -v node)"
fi

# Postgres for local (non-Docker) Cloud Agent runs
if ! command -v psql >/dev/null 2>&1; then
  sudo apt-get update -qq
  sudo DEBIAN_FRONTEND=noninteractive apt-get install -y -qq postgresql postgresql-contrib
fi

if [ ! -f .env ]; then
  cp .env.example .env
  SECRET="$(openssl rand -hex 32)"
  sed -i "s/^BETTER_AUTH_SECRET=.*/BETTER_AUTH_SECRET=${SECRET}/" .env
  sed -i 's/^SEED_ADMIN_PASSWORD=.*/SEED_ADMIN_PASSWORD=MosiMosiAdmin!2026/' .env
  sed -i 's|postgresql://mosi:mosi@localhost:5433/mosi|postgresql://mosi:mosi@localhost:5432/mosi|' .env
  sed -i 's/^POSTGRES_PORT=.*/POSTGRES_PORT=5432/' .env
  sed -i 's/^NODE_ENV=production/NODE_ENV=development/' .env
fi

# Install deps (npm install for brain until lockfile is fully synced on main)
(
  cd app/brain
  if npm ci --no-fund --no-audit; then
    echo "brain: npm ci ok"
  else
    echo "brain: npm ci failed, falling back to npm install"
    npm install --no-fund --no-audit
  fi
)

(
  cd app/phyxius
  npm ci --no-fund --no-audit
)

echo "cloud-install complete"
