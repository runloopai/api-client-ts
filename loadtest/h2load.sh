#!/usr/bin/env bash
#
# Wraps nghttp2's h2load against the multiplex test server for an apples-to-
# apples comparison against undici/node-fetch. Requires nghttp2 in $PATH.
#
# Usage:
#   ./loadtest/h2load.sh                  # default: 100k req, 100 conns, 32 streams
#   ./loadtest/h2load.sh 10000 50 10      # custom N, connections, streams
set -euo pipefail

if ! command -v h2load >/dev/null 2>&1; then
  echo "h2load not found. Install nghttp2 (apt: nghttp2-client, brew: nghttp2)" >&2
  exit 1
fi

N="${1:-100000}"
C="${2:-100}"
M="${3:-32}"

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
LOG="$(mktemp)"
PORT=""

cleanup() {
  if [[ -n "${SERVER_PGID:-}" ]]; then
    # Kill the entire process group so npx + the spawned node process both die.
    kill -TERM -- "-${SERVER_PGID}" 2>/dev/null || true
    sleep 0.2
    kill -KILL -- "-${SERVER_PGID}" 2>/dev/null || true
  fi
  rm -f "$LOG"
}
trap cleanup EXIT INT TERM

# Run the server in its own process group via setsid so we can signal the whole
# group on cleanup. exec replaces the subshell so the PID we capture *is* setsid.
setsid bash -c "cd \"$ROOT\" && exec npx tsx loadtest/h2-multiplex-server.ts" \
  > "$LOG" 2>&1 &
SERVER_PGID=$!

for _ in $(seq 1 50); do
  if grep -q "listening on port" "$LOG" 2>/dev/null; then
    PORT="$(grep -o 'port [0-9]\+' "$LOG" | head -1 | awk '{print $2}')"
    break
  fi
  sleep 0.1
done

if [[ -z "$PORT" ]]; then
  echo "server failed to start; log:" >&2
  cat "$LOG" >&2
  exit 1
fi

echo "h2load against https://localhost:$PORT/  (N=$N, C=$C, M=$M)"
# -k: skip TLS verification (server uses an ephemeral self-signed cert)
h2load -k -n "$N" -c "$C" -m "$M" "https://localhost:$PORT/"
