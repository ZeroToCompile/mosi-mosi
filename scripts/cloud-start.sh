#!/usr/bin/env bash
set -euo pipefail

export PATH="${HOME}/.nvm/versions/node/v22.22.2/bin:${PATH}"
cd /workspace

# Start PostgreSQL if installed locally
if command -v pg_lsclusters >/dev/null 2>&1; then
  if ! pg_lsclusters | awk 'NR>1 && $4=="online" {found=1} END{exit !found}'; then
    sudo pg_ctlcluster 16 main start || sudo pg_ctlcluster 15 main start || true
  fi
fi

# Ensure role + database exist
if command -v psql >/dev/null 2>&1; then
  sudo -u postgres psql -v ON_ERROR_STOP=1 <<'SQL' || true
DO $$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'mosi') THEN
    CREATE ROLE mosi LOGIN PASSWORD 'mosi';
  END IF;
END
$$;
SELECT 'CREATE DATABASE mosi OWNER mosi'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'mosi')\gexec
GRANT ALL PRIVILEGES ON DATABASE mosi TO mosi;
SQL
fi

set -a
# shellcheck disable=SC1091
source /workspace/.env
set +a

export NODE_ENV="${NODE_ENV:-development}"
export PORT_API="${API_PORT:-3011}"
export PORT_WEB="${WEB_PORT:-3020}"
export DATABASE_URL="${DATABASE_URL:-postgresql://mosi:mosi@localhost:5432/mosi}"
export BETTER_AUTH_URL="${BETTER_AUTH_URL:-http://localhost:3011}"
export BETTER_AUTH_TRUSTED_ORIGINS="${BETTER_AUTH_TRUSTED_ORIGINS:-http://localhost:3020,http://127.0.0.1:3020}"
export NEXT_PUBLIC_API_URL="${NEXT_PUBLIC_API_URL:-http://localhost:3011}"
export API_URL="${API_URL:-http://localhost:3011}"
export WEB_URL="${WEB_URL:-http://localhost:3020}"

# Migrate + seed (idempotent)
(
  cd /workspace/app/brain
  PORT="${PORT_API}" npm run auth:setup
)

mkdir -p /tmp/mosi-logs

# Start API if not already listening
if ! curl -sf "http://127.0.0.1:${PORT_API}/" >/dev/null 2>&1; then
  (
    cd /workspace/app/brain
    PORT="${PORT_API}" nohup npm run start:dev > /tmp/mosi-logs/api.log 2>&1 &
    echo $! > /tmp/mosi-logs/api.pid
  )
fi

# Start Web if not already listening
if ! curl -sf "http://127.0.0.1:${PORT_WEB}/" >/dev/null 2>&1; then
  (
    cd /workspace/app/phyxius
    PORT="${PORT_WEB}" NEXT_PUBLIC_API_URL="${NEXT_PUBLIC_API_URL}" API_URL="${API_URL}" \
      nohup npm run dev -- -H 0.0.0.0 -p "${PORT_WEB}" > /tmp/mosi-logs/web.log 2>&1 &
    echo $! > /tmp/mosi-logs/web.pid
  )
fi

# Wait for readiness
for i in $(seq 1 60); do
  api_ok=0
  web_ok=0
  curl -sf "http://127.0.0.1:${PORT_API}/" >/dev/null 2>&1 && api_ok=1
  curl -sf "http://127.0.0.1:${PORT_WEB}/" >/dev/null 2>&1 && web_ok=1
  if [ "$api_ok" = 1 ] && [ "$web_ok" = 1 ]; then
    echo "Ready: API :${PORT_API} Web :${PORT_WEB}"
    exit 0
  fi
  sleep 2
done

echo "Timed out waiting for services" >&2
tail -n 50 /tmp/mosi-logs/api.log || true
tail -n 50 /tmp/mosi-logs/web.log || true
exit 1
