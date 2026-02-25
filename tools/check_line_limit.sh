#!/usr/bin/env bash
# tools/check_line_limit.sh
# FD Policy: Every non-table logic/code file must be 500 lines or fewer.
# Usage: bash tools/check_line_limit.sh [file_or_dir]
# Exit: 0 = all pass, 1 = one or more failures
# Output: PASS/FAIL per file; summary at end.
#
# Exemptions (add paths relative to repo root):
# - docs/index.html (GitHub Pages UI single-page app; intentionally exceeds limit)
#
# To run against entire repo: bash tools/check_line_limit.sh .

set -euo pipefail

LIMIT=500
FAILED=0
CHECKED=0

EXEMPTIONS=(
  "docs/index.html"
)

is_exempt() {
  local target="$1"
  local norm_target
  norm_target=$(echo "$target" | sed 's|^\./||')
  for exempt in "${EXEMPTIONS[@]}"; do
    if [[ "$norm_target" == "$exempt" ]]; then
      return 0
    fi
  done
  return 1
}

should_check() {
  local file="$1"
  local ext="${file##*.}"
  case "$ext" in
    md|sh|py|js|ts|html|css|yml|yaml|json|txt) return 0 ;;
    *) return 1 ;;
  esac
}

check_file() {
  local file="$1"
  if is_exempt "$file"; then
    echo "SKIP: $file (exempted)"
    return
  fi
  if ! should_check "$file"; then
    return
  fi
  CHECKED=$((CHECKED + 1))
  local count
  count=$(wc -l < "$file")
  if [ "$count" -gt "$LIMIT" ]; then
    echo "FAIL: $file exceeds 500 lines ($count lines)"
    FAILED=$((FAILED + 1))
  else
    echo "OK: $file ($count lines)"
  fi
}

TARGET="${1:-.}"

if [ -f "$TARGET" ]; then
  check_file "$TARGET"
elif [ -d "$TARGET" ]; then
  while IFS= read -r -d '' file; do
    check_file "$file"
  done < <(find "$TARGET" \
    -not -path '*/.git/*' \
    -not -path '*/node_modules/*' \
    -not -path '*/evidence/*' \
    -type f -print0)
else
  echo "ERROR: $TARGET is not a file or directory"
  exit 1
fi

echo ""
echo "Line limit check complete: $CHECKED files checked, $FAILED failures."

if [ "$FAILED" -gt 0 ]; then
  exit 1
fi

exit 0
