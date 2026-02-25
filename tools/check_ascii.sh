#!/usr/bin/env bash
# tools/check_ascii.sh
# FD Policy: ASCII only in code and docs unless a file is explicitly exempted.
# Usage: bash tools/check_ascii.sh [file_or_dir]
# Exit: 0 = all pass, 1 = one or more failures
# Output: PASS/FAIL per file with line number of first violation.

set -euo pipefail

FAILED=0
CHECKED=0

# Add paths relative to repo root to exempt from ASCII check.
EXEMPTIONS=(
  # none currently
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

  # Find first non-ASCII byte. LC_ALL=C treats bytes literally.
  local result
  result=$(LC_ALL=C grep -Pn '[^\x00-\x7F]' "$file" | head -1 || true)

  if [ -n "$result" ]; then
    local linenum
    linenum=$(echo "$result" | cut -d: -f1)
    echo "FAIL: non-ASCII character found in $file (first occurrence: line $linenum)"
    FAILED=$((FAILED + 1))
  else
    echo "OK: $file"
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
echo "ASCII check complete: $CHECKED files checked, $FAILED failures."

if [ "$FAILED" -gt 0 ]; then
  exit 1
fi

exit 0
