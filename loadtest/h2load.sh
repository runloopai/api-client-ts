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
  if [[ -n "${SERVER_PID:-}" ]]; then kill "$SERVER_PID" 2>/dev/null || true; fi
  rm -f "$LOG"
}
trap cleanup EXIT

( cd "$ROOT" && npx tsx loadtest/h2-multiplex-server.ts ) > "$LOG" 2>&1 &
SERVER_PID=$!

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
h2load -n "$N" -c "$C" -m "$M" "https://localhost:$PORT/"
