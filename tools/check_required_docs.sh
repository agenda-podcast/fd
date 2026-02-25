#!/usr/bin/env bash
# tools/check_required_docs.sh
# FD Policy: Required documentation files must exist and must not be renamed.
# Usage: bash tools/check_required_docs.sh
# Exit: 0 = all required docs present, 1 = one or more missing.

set -euo pipefail

FAILED=0

REQUIRED_DOCS=(
  "docs/index.html"
  "docs/FD_DOCUMENTATION.md"
  "docs/WI_TEMPLATE.md"
  "docs/MILESTONE_TEMPLATE.md"
  "docs/E2E_VERIFICATION.md"
  "docs/RELEASE_RUNBOOK.md"
  "docs/.nojekyll"
  "tools/check_line_limit.sh"
  "tools/check_ascii.sh"
  "tools/check_required_docs.sh"
  "tools/check_wi_reference.sh"
  ".github/workflows/fd-ci.yml"
  ".github/workflows/deploy-pages.yml"
  ".github/PULL_REQUEST_TEMPLATE.md"
  "README.md"
  "requirements.txt"
  "fd-agent.py"
  "agents/__init__.py"
  "agents/config.py"
  "agents/memory.py"
  "agents/github_client.py"
  "agents/base_agent.py"
  "agents/team.py"
  "agents/run_agent.py"
  "memory/README.md"
  "config/.env.example"
)

for doc in "${REQUIRED_DOCS[@]}"; do
  if [ -f "$doc" ]; then
    echo "OK: $doc"
  else
    echo "FAIL: required file missing: $doc"
    FAILED=$((FAILED + 1))
  fi
done

echo ""
echo "Required docs check: ${#REQUIRED_DOCS[@]} files checked, $FAILED missing."

if [ "$FAILED" -gt 0 ]; then
  exit 1
fi

exit 0
