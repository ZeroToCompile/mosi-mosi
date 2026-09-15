#!/usr/bin/env bash
set -euo pipefail

# Install exact, pinned dependencies from the lockfile. `npm ci` removes any
# existing node_modules first, so it converges to the same state every run.
npm ci

# Create or update the Better Auth SQLite schema (user/session/account/
# verification tables) in ./sqlite.db. The CLI is idempotent: it reports
# "No migrations needed" once the schema is up to date.
npx --yes @better-auth/cli@latest migrate -y
