# Release Runbook (Canonical)

File: docs/RELEASE_RUNBOOK.md
Applies to: FAVELLA DEVELOPMENT only (FD-only rule)
Owner Role: Release Manager (QA Lead covers early milestones)

---

## 1) Release Readiness Checklist

Complete every item before cutting a release. All items are binary (done / not done).

- [ ] All WIs scoped to this release are in Accepted or Closed status.
- [ ] CI is green on main branch at the commit to be tagged.
- [ ] E2E Verification executed for all scenarios in regression matrix scope.
- [ ] E2E evidence files committed to `/evidence/` for this release scope.
- [ ] Rollback steps verified (Section 4) against the actual deploy target.
- [ ] Known limitations documented in this runbook under Section 5.
- [ ] No P0/P1 open defects linked to any WI in this release.
- [ ] GitHub Pages URL confirmed live and rendering correctly.
- [ ] Release tag follows convention: `vMAJOR.MINOR.PATCH` (ASCII, no spaces).

---

## 2) Release Execution Steps

Execute in order. Do not skip steps. Record each step as done with timestamp.

### Step 1: Verify CI green

1. Navigate to the repository's Actions tab.
2. Confirm the latest run on `main` is green (all jobs passing).
3. Copy the run URL. Record it in the Release Execution Record (Section 6).

### Step 2: Tag the release

```bash
git checkout main
git pull origin main
git tag -a vMAJOR.MINOR.PATCH -m "Release vMAJOR.MINOR.PATCH: [one-line summary]"
git push origin vMAJOR.MINOR.PATCH
```

### Step 3: Confirm GitHub Pages deployment

1. Navigate to repository Settings > Pages.
2. Confirm the source branch and folder are set to `main` / `/docs`.
3. Navigate to the published GitHub Pages URL.
4. Verify `/docs/index.html` loads without errors.
5. Spot-check at least two navigation links.

### Step 4: Run release E2E smoke

Execute E2E-001 and E2E-007 from `docs/E2E_VERIFICATION.md` against the
live GitHub Pages URL.

Record pass/fail for each scenario in the Release Execution Record.

### Step 5: Publish Release Execution Record

Append a new record block to Section 6 of this file and commit it to main.

---

## 3) GitHub Pages Configuration Notes

- Source: `main` branch, `/docs` folder.
- Custom domain: (none by default; add here if configured).
- HTTPS enforcement: enabled by default on GitHub Pages.
- Build: none required (static HTML/CSS/JS only).
- If Pages is not yet enabled: Settings > Pages > Source > Deploy from branch.

---

## 4) Rollback Procedure

Use this procedure if a release causes a regression that cannot be hotfixed
within one business day.

1. Identify the last known-good release tag (e.g., `v0.9.0`).
2. Create a revert branch:
   ```bash
   git checkout -b hotfix/rollback-to-v0.9.0
   git revert HEAD..v0.9.0 --no-edit
   git push origin hotfix/rollback-to-v0.9.0
   ```
3. Open a PR from `hotfix/rollback-to-v0.9.0` to `main`.
4. Ensure CI passes on the hotfix branch.
5. Merge the PR.
6. Tag the rollback commit:
   ```bash
   git tag -a vMAJOR.MINOR.PATCH-rollback -m "Rollback to v0.9.0 state"
   git push origin vMAJOR.MINOR.PATCH-rollback
   ```
7. Verify GitHub Pages serves the reverted state (allow up to 5 minutes).
8. Document the incident in the Release Execution Record with root cause.

---

## 5) Known Limitations (Append-Only)

| Release    | Limitation                                       | Accepted By | Date       |
|------------|--------------------------------------------------|-------------|------------|
| v1.0.0     | AI Chat requires user-supplied API key in browser. Key is not persisted. | Owner | TBD |
| v1.0.0     | CI line-limit and ASCII checks are warn-only until WI-002 ships. | Tech Lead | TBD |

---

## 6) Release Execution Records (Append-Only)

Append a new block for each release. Never edit past records.

---

### Release v1.0.0

Release ID: v1.0.0
Date: TBD
Release Manager: TBD

Included WIs:
- WI-001: Author FAVELLA DEVELOPMENT repository documentation

CI Run URL: (to be filled at release time)

E2E Scenarios Run:

| Scenario | Environment | Result  | Evidence Link              |
|----------|-------------|---------|----------------------------|
| E2E-001  | GitHub Pages | TBD    | /evidence/WI-001/          |
| E2E-002  | GitHub Pages | TBD    | /evidence/WI-001/          |
| E2E-007  | GitHub Pages | TBD    | /evidence/WI-001/          |

Incidents: None at time of runbook authoring.

Post-Release Monitoring Window: 24 hours after tag push.

Post-Release Outcomes: (to be filled after monitoring window closes)
