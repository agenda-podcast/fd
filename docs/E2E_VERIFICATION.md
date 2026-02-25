# E2E Verification (Canonical)

File: docs/E2E_VERIFICATION.md
Applies to: FAVELLA DEVELOPMENT only (FD-only rule)
Maintained by: QA Lead (receiver of all behavior-change WIs)

Update rule: Any WI that changes behavior must add or update at least one
scenario in this file before the PR is merged.

---

## 1) Test Environments

| Environment | Entry Criteria                         | Notes                        |
|-------------|----------------------------------------|------------------------------|
| Local       | Repo cloned; no build tooling required | Open /docs/index.html in browser |
| Dev         | Branch deployed to GitHub Pages preview | PR preview URL available     |
| Staging     | main branch; pre-release tag           | All WIs Accepted             |
| Prod        | Release tag; runbook executed          | Post-release record required |

---

## 2) Test Data Setup

For documentation and GitHub Pages UI testing, no external data is required.

Steps to establish a clean local test state:

1. Clone the repository to a local directory.
2. Open `/docs/index.html` in a modern browser (Chrome, Firefox, Safari, Edge).
3. No internet connection is required for static doc rendering.
4. For AI Chat features: obtain a valid Anthropic API key and enter it in the
   API Key field of the UI. The key is never stored server-side.
5. For CI checks: ensure Python 3.8+ and bash are available.

---

## 3) Scenarios

### E2E-001: Documentation UI loads without build tooling

Related WIs: WI-001

Preconditions:
- Repository cloned locally.
- No npm, Python, or other build tools invoked.

Steps:
1. Navigate to `/docs/index.html` in a browser using `file://` protocol.
2. Observe the page load.

Expected Results:
- Page renders within 3 seconds.
- Left navigation shows all sections: Start Here, Roles, Templates,
  Verification, Policies, Evidence, AI Chat.
- Main panel shows "Start Here" content.
- No console errors related to missing resources.
- No server required.

Evidence Required:
- Screenshot of rendered page in `/evidence/WI-001/E2E-001-ui-load.png`.

---

### E2E-002: Work Item template copy button

Related WIs: WI-001

Preconditions:
- UI loaded per E2E-001.

Steps:
1. Click "Templates" in left navigation.
2. Click the "Copy WI Template" button.
3. Paste clipboard content into a text editor.

Expected Results:
- Clipboard contains the full WI template text.
- Template text matches `docs/WI_TEMPLATE.md` exactly (no truncation).
- No alert or error displayed.

Evidence Required:
- Screenshot of pasted template in `/evidence/WI-001/E2E-002-copy-template.png`.

---

### E2E-003: CI line-limit check fails on 500+ line file

Related WIs: WI-001

Preconditions:
- Python 3.8+ available.
- `tools/check_line_limit.sh` executable.

Steps:
1. Create a temporary test file with 501 lines of content:
   `python3 -c "print('\n'.join(['x']*501))" > /tmp/test_oversize.py`
2. Run: `bash tools/check_line_limit.sh /tmp/test_oversize.py`

Expected Results:
- Exit code is non-zero (failure).
- Output contains the message: `FAIL: /tmp/test_oversize.py exceeds 500 lines`

Evidence Required:
- Terminal screenshot in `/evidence/WI-001/E2E-003-line-limit-fail.png`.

---

### E2E-004: CI line-limit check passes on 500-line file

Related WIs: WI-001

Preconditions:
- Python 3.8+ available.
- `tools/check_line_limit.sh` executable.

Steps:
1. Create a temporary test file with exactly 500 lines:
   `python3 -c "print('\n'.join(['x']*500))" > /tmp/test_ok.py`
2. Run: `bash tools/check_line_limit.sh /tmp/test_ok.py`

Expected Results:
- Exit code is 0 (success).
- Output contains: `OK: /tmp/test_ok.py`

Evidence Required:
- Terminal screenshot in `/evidence/WI-001/E2E-004-line-limit-pass.png`.

---

### E2E-005: CI ASCII check fails on non-ASCII character

Related WIs: WI-001

Preconditions:
- Python 3.8+ available.
- `tools/check_ascii.sh` executable.

Steps:
1. Create a temporary test file containing a non-ASCII character:
   `printf 'hello\xc3\xa9world\n' > /tmp/test_nonascii.txt`
2. Run: `bash tools/check_ascii.sh /tmp/test_nonascii.txt`

Expected Results:
- Exit code is non-zero.
- Output contains: `FAIL: non-ASCII character found in /tmp/test_nonascii.txt`

Evidence Required:
- Terminal screenshot in `/evidence/WI-001/E2E-005-ascii-fail.png`.

---

### E2E-006: Release checklist confirms rollback steps present

Related WIs: WI-001

Preconditions:
- `docs/RELEASE_RUNBOOK.md` exists in repository.

Steps:
1. Open `docs/RELEASE_RUNBOOK.md`.
2. Search for the section titled "Rollback Procedure."
3. Verify rollback steps are numbered and reproducible.

Expected Results:
- Section "Rollback Procedure" is present.
- At least two numbered steps are listed under rollback.
- Steps reference specific commands or actions (not vague descriptions).

Evidence Required:
- Screenshot of rollback section in `/evidence/WI-001/E2E-006-rollback-steps.png`.

---

### E2E-007: AI Chat loads and routes to correct agent

Related WIs: WI-001

Preconditions:
- UI loaded per E2E-001.
- Valid Anthropic API key entered in API Key field.

Steps:
1. Click "AI Chat" in left navigation.
2. In agent selector, choose "@techlead".
3. Type: "What are your deliverables in FD?"
4. Submit message.

Expected Results:
- Response references Tech Lead role deliverables from FD documentation.
- Response is attributed to "@techlead" agent.
- Response arrives within 30 seconds.
- No API key is visible in the UI or console logs.

Evidence Required:
- Screenshot of agent response in `/evidence/WI-001/E2E-007-ai-chat.png`.

---

## 4) Regression Matrix

| When This Changes          | Re-run These Scenarios         |
|----------------------------|--------------------------------|
| docs/index.html            | E2E-001, E2E-002, E2E-007      |
| docs/WI_TEMPLATE.md        | E2E-002                        |
| tools/check_line_limit.sh  | E2E-003, E2E-004               |
| tools/check_ascii.sh       | E2E-005                        |
| docs/RELEASE_RUNBOOK.md    | E2E-006                        |
| AI agent system prompts    | E2E-007                        |
| Any CI workflow file       | E2E-003, E2E-004, E2E-005      |
| FD_DOCUMENTATION.md        | E2E-001 (navigation smoke)     |

---

## 5) Evidence Capture Instructions

For each scenario run:
1. Capture a screenshot at the moment of the expected result.
2. Name the file: `E2E-###-description.png` (ASCII only, hyphen-separated).
3. Place in `/evidence/WI-###/` where WI-### is the WI that introduced the change.
4. Add the evidence link to the PR description and WI file.
5. Do not include credentials, personal data, or internal tokens in screenshots.
