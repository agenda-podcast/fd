# agents/memory.py
# Persistent memory for FD agents.
# Each agent has a private JSON store and all agents share a common store.
# FD Policy: ASCII-only, <= 500 lines.

import json
import os
import time
from pathlib import Path
from typing import Any, Dict, List, Optional


MEMORY_ROOT = Path(__file__).parent.parent / "memory"
AGENTS_MEMORY_DIR = MEMORY_ROOT / "agents"
SHARED_MEMORY_DIR = MEMORY_ROOT / "shared"
MAX_HISTORY_ENTRIES = 100
MAX_DECISIONS = 200


def _ensure_dirs() -> None:
    AGENTS_MEMORY_DIR.mkdir(parents=True, exist_ok=True)
    SHARED_MEMORY_DIR.mkdir(parents=True, exist_ok=True)


def _load(path: Path) -> Dict:
    if not path.exists():
        return {}
    try:
        with open(path, "r", encoding="ascii") as f:
            return json.load(f)
    except (json.JSONDecodeError, UnicodeDecodeError):
        return {}


def _save(path: Path, data: Dict) -> None:
    _ensure_dirs()
    with open(path, "w", encoding="ascii") as f:
        json.dump(data, f, indent=2, ensure_ascii=True)


def _agent_path(agent_key: str) -> Path:
    return AGENTS_MEMORY_DIR / f"{agent_key}.json"


def _shared_path(store: str) -> Path:
    return SHARED_MEMORY_DIR / f"{store}.json"


# ---------------------------------------------------------------------------
# Agent private memory
# ---------------------------------------------------------------------------

def load_agent_memory(agent_key: str) -> Dict:
    """Load the private memory store for an agent."""
    data = _load(_agent_path(agent_key))
    data.setdefault("history", [])
    data.setdefault("notes", {})
    data.setdefault("last_active", None)
    return data


def save_agent_memory(agent_key: str, data: Dict) -> None:
    """Persist the private memory store for an agent."""
    data["last_active"] = time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())
    history = data.get("history", [])
    if len(history) > MAX_HISTORY_ENTRIES:
        data["history"] = history[-MAX_HISTORY_ENTRIES:]
    _save(_agent_path(agent_key), data)


def append_conversation(agent_key: str, role: str, content: str) -> None:
    """Append a message turn to an agent's conversation history."""
    data = load_agent_memory(agent_key)
    data["history"].append({
        "role": role,
        "content": content,
        "ts": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
    })
    save_agent_memory(agent_key, data)


def get_conversation_history(agent_key: str, limit: int = 20) -> List[Dict]:
    """Return the last N turns as anthropic-compatible message dicts."""
    data = load_agent_memory(agent_key)
    history = data.get("history", [])
    turns = history[-limit:]
    return [{"role": t["role"], "content": t["content"]} for t in turns]


def set_agent_note(agent_key: str, key: str, value: str) -> None:
    """Set a named note in an agent's private store."""
    data = load_agent_memory(agent_key)
    data["notes"][key] = value
    save_agent_memory(agent_key, data)


def get_agent_note(agent_key: str, key: str) -> Optional[str]:
    """Get a named note from an agent's private store."""
    data = load_agent_memory(agent_key)
    return data["notes"].get(key)


def clear_agent_history(agent_key: str) -> None:
    """Clear conversation history for an agent (keeps notes)."""
    data = load_agent_memory(agent_key)
    data["history"] = []
    save_agent_memory(agent_key, data)


# ---------------------------------------------------------------------------
# Shared memory (all agents can read/write)
# ---------------------------------------------------------------------------

def load_shared(store: str) -> Dict:
    """Load a shared memory store (e.g. 'decisions', 'work_items')."""
    return _load(_shared_path(store))


def save_shared(store: str, data: Dict) -> None:
    """Persist a shared memory store."""
    _save(_shared_path(store), data)


def log_decision(agent_key: str, decision: str, context: str = "") -> None:
    """Append a team decision to shared decisions log."""
    data = load_shared("decisions")
    entries = data.get("entries", [])
    entries.append({
        "agent": agent_key,
        "decision": decision,
        "context": context,
        "ts": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
    })
    if len(entries) > MAX_DECISIONS:
        entries = entries[-MAX_DECISIONS:]
    data["entries"] = entries
    save_shared("decisions", data)


def get_recent_decisions(limit: int = 10) -> List[Dict]:
    """Return the most recent team decisions."""
    data = load_shared("decisions")
    entries = data.get("entries", [])
    return entries[-limit:]


def update_work_item_state(wi_id: str, status: str, note: str = "") -> None:
    """Update the in-memory status of a work item."""
    data = load_shared("work_items")
    items = data.get("items", {})
    items[wi_id] = {
        "status": status,
        "note": note,
        "updated": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
    }
    data["items"] = items
    save_shared("work_items", data)


def get_work_item_state(wi_id: str) -> Optional[Dict]:
    """Get the in-memory status of a work item."""
    data = load_shared("work_items")
    return data.get("items", {}).get(wi_id)


def summarize_memory(agent_key: str) -> str:
    """Return a human-readable summary of an agent's memory state."""
    data = load_agent_memory(agent_key)
    history_count = len(data.get("history", []))
    notes = data.get("notes", {})
    last_active = data.get("last_active", "never")
    lines = [
        f"Agent: {agent_key}",
        f"Last active: {last_active}",
        f"Conversation turns stored: {history_count}",
        f"Notes stored: {len(notes)}",
    ]
    for k, v in notes.items():
        lines.append(f"  {k}: {v[:80]}")
    recent = get_recent_decisions(5)
    if recent:
        lines.append(f"Recent team decisions ({len(recent)}):")
        for d in recent:
            lines.append(f"  [{d['agent']}] {d['decision'][:80]}")
    return "\n".join(lines)
