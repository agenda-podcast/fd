# Work Item Template (Canonical)

File: docs/WI_TEMPLATE.md
Applies to: FAVELLA DEVELOPMENT only (FD-only rule)

Copy the block below exactly. Fill every field. Do not remove fields.
Do not use "N/A" without an explicit reason. Do not use ellipses.

---

```
Work Item ID: WI-###
Milestone ID: MS-###
Title: [Verb + outcome]
Owner Role (Producer): [Exactly one role from the FD Role Catalog]
Receiver Role (Next step): [Exactly one role from the FD Role Catalog]
Type: [Feature | Bug | Tech Debt | Experiment]
Priority: [P0 | P1 | P2]
Target Environment: [Local | Dev | Staging | Prod | GitHub | GitHub Pages]

---

Intent and Scope

Problem / Goal (2-3 lines):
[State what is broken or missing and the desired outcome. No more than 3 lines.]

In Scope:
- [Item 1]
- [Item 2]

Out of Scope:
- [Item 1]
- [Item 2]

Assumptions:
- [Item 1]

Dependencies (explicit IDs):
- [WI-### | MS-### | None (foundational)]

---

Acceptance Criteria (Must be objectively testable)

AC1: Given [precondition], when [action], then [outcome].
AC2: Given [precondition], when [action], then [outcome].
[Add AC3-AC10 as needed. Each must be independently testable.]

---

Evidence Required

- [Code link | Test output | Screens | API examples | Metrics]
- Evidence folder: /evidence/WI-###/

---

Definition of Done (Quality Gates)

- All ACs met in target environment.
- CI passes.
- No P0/P1 open defects linked to this WI.
- Security/logging basics met (no secrets; no sensitive data).
- Evidence attached in /evidence/WI-###/.
- Handoff checklist completed.

---

Handoff Checklist (Owner to Receiver)

- [ ] Receiver can reproduce verification steps independently.
- [ ] Config notes included (environment variables, settings).
- [ ] Rollback notes included (if deploy-affecting).
- [ ] Known limitations listed explicitly.
- [ ] Status updated to "Ready for Receiver."

---

Status: [Draft | Ready for Receiver | In Review | Rework | Accepted | Closed]

Status rules:
- Only the Receiver can mark Accepted.
- "Ready for Receiver" requires all Handoff Checklist items checked.
- "Rework" returns to Producer with a written reason.
```

---

## Status Transition Rules

```
Draft
  -> Ready for Receiver  (Producer completes all gates)
     -> In Review        (Receiver begins evaluation)
        -> Rework        (Receiver identifies gaps; written reason required)
           -> Ready for Receiver  (Producer resolves all gaps)
        -> Accepted       (Receiver confirms all ACs met; only Receiver can set)
           -> Closed      (Post-acceptance bookkeeping complete)
```

## Atomicity Checklist (Before Submitting)

Answer YES to all or split the WI:

1. Does this WI have exactly one receiver?
2. Can every AC be tested without interpretation?
3. Is there exactly one "next step" after Accepted?
4. Can this WI ship independently without blocking another incomplete WI?
5. Is the scope free of "and also" additions?
