# Milestone Template (Canonical)

File: docs/MILESTONE_TEMPLATE.md
Applies to: FAVELLA DEVELOPMENT only (FD-only rule)

Copy the block below exactly. Fill every field.

---

```
Milestone ID: MS-###
Title: [Verb + outcome at milestone scope]
Owner Role (Producer): Owner
Receiver Role (Next step): Product Manager
Status: [Draft | Approved | In Progress | Complete | Cancelled]

---

Intent Brief

Target User:
[Who benefits from this milestone being complete.]

Problem:
[What is broken, missing, or below standard. 3-5 lines max.]

Success Signal:
[Observable, measurable outcome that proves the milestone is done.
 Not a list of tasks. One clear signal.]

Constraints:
- [Constraint 1: time, cost, technical, policy]
- [Constraint 2]

---

Scope Boundary

In Scope:
- [Item 1]
- [Item 2]

Out of Scope:
- [Item 1]
- [Item 2]

---

Work Item List (ordered by dependency)

| Order | WI ID  | Title              | Owner Role       | Blocked By |
|-------|--------|--------------------|------------------|------------|
| 1     | WI-### | [short title]      | [role]           | None       |
| 2     | WI-### | [short title]      | [role]           | WI-###     |

---

Risks and Mitigations

| Risk                        | Likelihood | Impact | Mitigation               |
|-----------------------------|------------|--------|--------------------------|
| [Risk 1]                    | High/Med/Low | High/Med/Low | [Action]         |

---

Acceptance Memo Criteria

The Owner issues an Acceptance Memo when:
- [ ] All WIs in the WI List are Closed.
- [ ] Success Signal is demonstrably met (evidence link: _______).
- [ ] No P0/P1 defects remain open against this milestone.
- [ ] Release runbook executed and execution record published.
- [ ] Known limitations documented and accepted.

---

Known Limitations at Approval:
- [Item 1 | None]
```
