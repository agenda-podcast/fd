# /memory - FD Agent Persistent Memory

Agents store conversation history, notes, and shared decisions here.

---

## Structure

```
memory/
  agents/
    owner.json       Private memory for @owner
    pm.json          Private memory for @pm
    ux.json          Private memory for @ux
    techlead.json    Private memory for @techlead
    fe.json          Private memory for @fe
    be.json          Private memory for @be
    devops.json      Private memory for @devops
    reviewer.json    Private memory for @reviewer
    qa.json          Private memory for @qa
    release.json     Private memory for @release
  shared/
    work_items.json  In-memory WI status (mirrors /backlog state)
    decisions.json   Shared team decision log (append-only)
```

---

## Agent Memory Schema (agents/*.json)

```json
{
  "history": [
    {
      "role": "user",
      "content": "...",
      "ts": "2025-01-01T00:00:00Z"
    },
    {
      "role": "assistant",
      "content": "...",
      "ts": "2025-01-01T00:00:01Z"
    }
  ],
  "notes": {
    "key": "value"
  },
  "last_active": "2025-01-01T00:00:01Z"
}
```

- `history`: last 100 turns of conversation (older turns are pruned)
- `notes`: named key-value store for agent-specific context
- `last_active`: ISO8601 UTC timestamp of last activity

---

## Shared Memory Schema (shared/decisions.json)

```json
{
  "entries": [
    {
      "agent": "techlead",
      "decision": "docs/index.html exempted from 500-line limit",
      "context": "WI-001",
      "ts": "2025-01-01T00:00:00Z"
    }
  ]
}
```

- Entries are append-only. Never delete past decisions.
- Last 200 decisions are retained (older entries pruned).
- All agents can read and write to this file.

---

## Shared Memory Schema (shared/work_items.json)

```json
{
  "items": {
    "WI-001": {
      "status": "Ready for Receiver",
      "note": "...",
      "updated": "2025-01-01T00:00:00Z"
    }
  }
}
```

This is a live cache. The authoritative WI state is in /backlog/work_items/.

---

## Rules

- Memory files use ASCII encoding only.
- Memory files are gitignored by default (see .gitignore).
- To share memory across a team, remove from .gitignore and commit.
- Never store secrets, API keys, or personal data in memory files.
- Prune rules are enforced by agents/memory.py automatically.
