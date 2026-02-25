#!/usr/bin/env bash
# tools/check_wi_reference.sh
# FD Policy: WI IDs referenced in PR title/body must exist in /backlog/work_items/.
# Usage: bash tools/check_wi_reference.sh "WI-001 WI-002"
# Exit: 0 = all referenced WIs found, 1 = one or more missing.
# Note: In CI, extract WI IDs from PR title and body before calling this script.

set -euo pipefail

FAILED=0
INPUT="${1:-}"

if [ -z "$INPUT" ]; then
  echo "Usage: bash tools/check_wi_reference.sh \"WI-001 WI-002\""
  echo "Pass a space-separated list of WI IDs to verify."
  exit 0
fi

WI_IDS=($INPUT)

for wi_id in "${WI_IDS[@]}"; do
  if [[ ! "$wi_id" =~ ^WI-[0-9]{3,}$ ]]; then
    echo "SKIP: $wi_id (not a valid WI ID pattern WI-###)"
    continue
  fi
  found=$(find backlog/work_items -name "${wi_id}*" 2>/dev/null | head -1 || true)
  if [ -n "$found" ]; then
    echo "OK: $wi_id -> $found"
  else
    echo "FAIL: $wi_id not found in backlog/work_items/"
    FAILED=$((FAILED + 1))
  fi
done

if [ "$FAILED" -gt 0 ]; then
  echo ""
  echo "WI reference check failed: $FAILED WI(s) not found in backlog."
  exit 1
fi

echo ""
echo "WI reference check passed."
exit 0
