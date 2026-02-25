# FAVELLA DEVELOPMENT (FD) Documentation

Version: 1.0
Canonical location: docs/FD_DOCUMENTATION.md
Applies to: FAVELLA DEVELOPMENT only (FD-only rule)

---

## 0) FD-Only Rule (Hard Boundary)

This repository and its documentation must not include:

- Any description, architecture, schemas, or workflows belonging to other products.
- Any references to other repos/products as "the same thing" or as dependencies
  unless explicitly added as an FD dependency with an ID.

If content is not clearly FD, it does not belong here.

---

## 1) What FD Is

FAVELLA DEVELOPMENT (FD) is a GitHub-native, role-driven engineering system that:

- Converts ideas into shippable increments using atomic work items.
- Enforces a strict 1-to-1 producer/receiver handoff model.
- Publishes a static documentation and UI layer via GitHub Pages.
- Treats verification as a first-class deliverable (E2E Verification is always updated).

FD is not "a collection of notes." FD is an execution framework: definitions,
artifacts, workflows, and checks that let contributors deliver changes predictably.

---

## 2) Engineering Principles (Non-Negotiable)

These principles are enforced by process and (where feasible) CI.

### 2.1 Small Chunk Deliverable Criteria (Definition of Done for any deliverable)

A deliverable is acceptable only if it is:

**1. Atomic**
- One purpose
- One receiver
- One clear next step

**2. Testable**
- Objective acceptance criteria or verification evidence exists
- Pass/fail is unambiguous

**3. Traceable**
- References the Work Item ID and Milestone ID
- Evidence points back to the work item

**4. Non-ambiguous**
- The receiver can proceed with zero follow-up questions

### 2.2 1-to-1 Handoff Policy (Strict)

- Every deliverable has exactly one producer and exactly one receiver.
- If multiple roles contribute, they contribute inputs. One owner role publishes the final artifact.
- "Everyone agrees" is not a handoff. A named receiver is required.

### 2.3 Allowed Loops (Only These)

Loops are allowed only in:

- A) Spec refinement: PM and UX
- B) Technical feasibility: Tech Lead and PM
- C) Code review: Engineer and Code Reviewer
- D) QA verification: QA Lead and Engineer

Every loop has a closure condition (see Section 6).

### 2.4 Always Update E2E Verification

Whenever FD adds or changes functionality, scenarios, outputs, releases, schemas,
or processes, the E2E Verification workflow/tests must be updated to include the
new/changed coverage.

### 2.5 File and Content Constraints

- Keep every non-table logic/code file to 500 lines or fewer.
- Do not use ellipses (...) to omit content. No truncation.
- Use ASCII only (unless a specific file is explicitly exempted in policy).
- Do not change sensitive or existing production-critical logic without explicit
  approval where such a rule is declared for FD components.

---

## 3) Repository Structure (GitHub and GitHub Pages)

FD is designed to be browsable and usable directly in GitHub and via GitHub Pages.

### 3.1 Required Top-Level Directories

```
/docs
  index.html
  assets/
  FD_DOCUMENTATION.md
  WI_TEMPLATE.md
  MILESTONE_TEMPLATE.md
  E2E_VERIFICATION.md
  RELEASE_RUNBOOK.md
/backlog
  milestones/
  work_items/
/evidence
  WI-###/
/src
  (FD codebase, if any)
/tools
  (repo scripts, checks, generators)
/.github
  workflows/
```

### 3.2 What Each Folder Means

- `/docs`: Human-facing documentation and the GitHub Pages UI entrypoint.
- `/backlog`: Work items and milestones as versioned files.
- `/evidence`: Attachments (screens, logs, outputs) tied to a work item.
- `/src`: Product code (FD-owned).
- `/tools`: Scripts that enforce or assist FD policies.
- `/.github/workflows`: CI policies, doc checks, release checks.

### 3.3 GitHub Pages UI Policy

- UI uses GitHub Pages and must be static (HTML/CSS/JS).
- UI must not require a server to render documentation.
- UI must link to canonical markdown docs and render cleanly in a browser.

Minimum UI behaviors:
- Left-nav: sections and templates
- Main panel: renders markdown (or pre-rendered HTML equivalents)
- "Copy" buttons for templates (WI, Milestone, E2E steps)
- "Evidence" links resolve to /evidence/WI-###/

---

## 4) Artifact System (What Gets Produced)

FD is defined by its artifacts. Every artifact must be:
- Versioned in Git
- Traceable to WI/Milestone
- Built for handoff

### 4.1 Artifact Types (FD Core)

1. Milestone Intent Brief (Owner to PM)
2. Work Item (Producer to Receiver)
3. Technical Approach Note (Tech Lead to PM)
4. Implementation Branch / PR (Engineer to Code Reviewer)
5. Evidence Pack (Engineer to QA Lead)
6. E2E Verification Update (Owner role of change to QA Lead)
7. Release Runbook and Execution Record (Release Manager to Owner)

### 4.2 Artifact Naming Rules

- Work items: `WI-###-short-title.md`
- Milestones: `MS-###-short-title.md`
- Evidence folder: `/evidence/WI-###/`
- PR title includes `WI-###`
- Commit messages include `WI-###` when feasible

---

## 5) Work Item (WI) System

A work item is the smallest independently shippable slice.

See `docs/WI_TEMPLATE.md` for the canonical template.

### 5.2 WI Atomicity Rules

A WI is invalid if:
- It has multiple receivers.
- It has "and also" scope that implies multiple independent deliverables.
- Acceptance criteria cannot be tested without interpretation.

If a WI seems "big," split into multiple WIs that can ship independently.

---

## 6) Roles, Responsibilities, Deliverables, Loop Closure

FD uses role separation to enforce clean handoffs and reduce ambiguity.

### 6.1 Role Catalog (FD)

- Owner (Founder / Business Owner)
- Product Manager (PM)
- UX
- Tech Lead (Architecture / Delivery Lead)
- Frontend Engineer (FE)
- Backend Engineer (BE)
- DevOps / Platform Engineer
- Code Reviewer
- QA Lead
- Release Manager (optional; QA Lead can cover early)

### 6.2 Deliverables by Role (FD Standard)

**Owner**
- Milestone Intent Brief
- Milestone Approval
- Milestone Acceptance Memo
- Loop closure: milestone has clear success signal, non-contradictory constraints,
  approved scope boundary.

**PM**
- Backlog decomposition into WIs
- WI prioritization and dependencies
- Acceptance criteria quality control
- Loop closure: all open questions resolved, ACs testable, scope boundary explicit.

**UX**
- UI specs for GitHub Pages UI (wireframes, flows)
- Content IA (information architecture) for docs UI
- Loop closure: PM accepts spec, no unanswered UX questions.

**Tech Lead**
- Technical Approach Note
- Implementation Plan (sequenced WIs)
- Interfaces/contracts/NFRs
- Release readiness criteria
- Loop closure:
  - Tech Lead and PM feasibility: PM signs off on scope/plan fit
  - Tech Lead and DevOps feasibility: deploy/monitor requirements implementable

**Engineers (FE/BE)**
- Implementation branch + PR
- Evidence pack for QA
- Telemetry/diagnostics map (if applicable)
- Loop closure: reviewer checklist passes, no change requests open, build green.

**DevOps / Platform Engineer**
- CI pipeline configuration
- Deploy/runbook + rollback verification
- Observability setup as required
- Loop closure: deployment repeatable, rollback verified once, monitoring detects
  key failure modes.

**Code Reviewer**
- PR decision: Approve / Request changes + checklist annotations
- Merge confirmation + summary to QA
- Loop closure: all change requests addressed, CI green, PR merged.

**QA Lead**
- Verification record: repro original issue fixed
- Regression checks
- Mark defect "Verified" or WI "Accepted" (as receiver)
- Loop closure: fix deployed to target env, cannot reproduce original issue,
  regression passes.

---

## 7) Verification System (E2E Verification is Mandatory)

File: `docs/E2E_VERIFICATION.md` is canonical.

### 7.1 E2E Verification Contents

E2E Verification must define:
- Test environments (Local/Dev/Staging/Prod) and entry criteria
- Test data setup (deterministic steps)
- Scenarios list with IDs (E2E-###)
- Expected outputs (exact)
- Evidence capture instructions
- Regression matrix (what must be rechecked when X changes)

### 7.2 E2E Scenario Format

Each scenario must be deterministic, reproducible, pass/fail exact, and traceable.

See `docs/E2E_VERIFICATION.md` for the canonical scenario template.

### 7.3 Update Rule (Non-Optional)

If a WI changes behavior, it must:
- Add or update at least one E2E scenario
- Update regression matrix if blast radius changes
- Add evidence links to `/evidence/WI-###/`

---

## 8) Change Control and Quality Gates

### 8.1 PR Requirements

Every PR must include:
- Link to WI file in `/backlog/work_items/`
- Acceptance criteria mapping (what changed, which ACs satisfied)
- Evidence links (screens/logs/output)
- E2E verification update if behavior changed
- Rollback note if deploy-affecting

### 8.2 CI Required Checks (FD Baseline)

CI must fail if:
- A non-table logic/code file exceeds 500 lines
- Prohibited non-ASCII characters appear where restricted
- Required docs are missing/renamed
- WI referenced in PR title/body cannot be found
- E2E verification not updated when labeled "behavior-change"

### 8.3 Security and Data Handling

- No secrets in repo. Use placeholders.
- Evidence must not contain credentials or personal sensitive data.
- Logs should avoid sensitive fields; include correlation IDs where applicable.

---

## 9) Release System

File: `docs/RELEASE_RUNBOOK.md` is canonical.

### 9.1 Release Readiness Criteria

A release is allowed only if:
- All included WIs are Accepted
- CI green on main
- E2E Verification executed for release scope
- Rollback steps are present and were sanity-checked
- Known limitations are documented

### 9.2 Release Execution Record

Every release must produce a record (append-only) containing:
- Release ID / tag
- Included PRs and WIs
- Verification evidence links
- Any incidents and mitigations
- Post-release monitoring summary window and outcomes

---

## 10) GitHub Pages UI: Documentation-as-Product

FD documentation is not secondary. It is the interface to FD.

### 10.1 UI Content Requirements

The GitHub Pages UI must provide:
- A "Start Here" page (FD overview + how to create a WI)
- Role pages (deliverables + checklists)
- Templates page (WI/Milestone/E2E/Release templates)
- Verification page (E2E scenarios + regression matrix)
- Policies page (500-lines, ASCII-only, no ellipses, loop rules)
- Evidence browser (links into /evidence/)
- AI Chat interface (role-based agents per Section 10.3)

### 10.2 UI Integrity Rules

- Links must be stable and relative (work in Pages and local file open).
- No build required to view.
- Markdown rendering must be deterministic and offline-capable (client-side).

### 10.3 AI Agent Roster (FD)

Each role has a dedicated AI Agent accessible via the AI Chat UI:

| Agent Handle    | Role                        |
|-----------------|----------------------------|
| @owner          | Owner / Founder             |
| @pm             | Product Manager             |
| @ux             | UX Designer                 |
| @techlead       | Tech Lead                   |
| @fe             | Frontend Engineer           |
| @be             | Backend Engineer            |
| @devops         | DevOps / Platform Engineer  |
| @reviewer       | Code Reviewer               |
| @qa             | QA Lead                     |
| @release        | Release Manager             |

Agents can be addressed individually or together (team mode).
Agents may propose code changes; deployment requires a PR merged to main via CI.

---

## 11) Operating Model: How Work Flows End-to-End

This is the canonical FD execution chain.

1. Owner publishes Milestone Intent Brief (MS-###)
2. PM decomposes milestone into WIs (WI-###)
3. Tech Lead writes Technical Approach Note + implementation sequence
4. Engineer implements WI in PR, attaches Evidence Pack
5. Code Reviewer approves/merges
6. QA validates against AC + E2E scenarios, marks Accepted
7. Release Manager executes runbook and publishes execution record
8. Owner issues Milestone Acceptance Memo

At each step: single producer to single receiver.

---

## 12) Templates (Canonical References)

- WI template: `docs/WI_TEMPLATE.md`
- Milestone template: `docs/MILESTONE_TEMPLATE.md`
- E2E template: `docs/E2E_VERIFICATION.md`
- Release runbook: `docs/RELEASE_RUNBOOK.md`

No template drift is allowed without a WI that updates templates and CI checks.

---

## 13) Known Limitations (Explicit)

Until FD automates all checks, the following may be manual:
- Enforcing 500-line limit
- ASCII-only validation
- Detecting behavior-change vs doc updates

If any of the above is still manual, FD must create WIs to automate them in CI.

---

## 14) How This Documentation Is Maintained

### 14.1 Change Policy

Any change to roles, templates, CI gates, status model, E2E rules, or release
rules must be introduced via a WI with acceptance criteria and evidence.

### 14.2 Documentation Quality Gates

Docs changes must:
- Preserve FD-only rule
- Preserve template structure
- Avoid ambiguity (receiver must proceed without questions)
- Avoid ellipses and truncation
- Remain consistent with CI checks

---

## Appendix A: Milestone Template (Summary)

A Milestone file must include:
- Milestone ID: MS-###
- Intent brief: target user, problem, success signal, constraints
- Scope boundary (in/out)
- WI list + dependency ordering
- Risks and mitigations
- Acceptance memo criteria

See `docs/MILESTONE_TEMPLATE.md` for the full canonical template.

---

## Appendix B: Example "Small Chunk" WI (Illustrative)

```
Work Item ID: WI-010
Milestone ID: MS-001
Title: Add doc navigation to GitHub Pages UI
Owner Role (Producer): Frontend Engineer
Receiver Role (Next step): QA Lead
Type: Feature
Priority: P0
Target Environment: GitHub Pages

Acceptance Criteria:
AC1: Given the UI loads, when I click "Templates," then WI template renders
     in main panel.
AC2: Given a broken link exists, when CI runs, then it fails with the
     broken link path.

Evidence:
- Screenshots in /evidence/WI-010/
- CI run link recorded in the WI
```
