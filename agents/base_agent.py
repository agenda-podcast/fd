# agents/base_agent.py
# FDAgent: base class for all FD role agents.
# Handles Anthropic API calls, memory, and GitHub deployments.
# FD Policy: ASCII-only, <= 500 lines.

import os
import sys
from typing import Optional

try:
    import anthropic
    ANTHROPIC_AVAILABLE = True
except ImportError:
    ANTHROPIC_AVAILABLE = False

from agents.config import AGENTS
from agents import memory as mem
from agents import github_client as gh


def _load_env() -> None:
    """Load .env file if present (uses python-dotenv if available)."""
    try:
        from dotenv import load_dotenv
        env_path = os.path.join(os.path.dirname(__file__), "..", ".env")
        load_dotenv(dotenv_path=env_path)
    except ImportError:
        pass


_load_env()


class FDAgent:
    """
    A FAVELLA DEVELOPMENT role agent.

    Usage:
        agent = FDAgent("techlead")
        response = agent.chat("What is the sequencing for MS-001?")
        print(response)
    """

    def __init__(self, agent_key: str, fresh_session: bool = False):
        if agent_key not in AGENTS:
            valid = ", ".join(AGENTS.keys())
            raise ValueError(f"Unknown agent: '{agent_key}'. Valid: {valid}")
        self.key = agent_key
        self.cfg = AGENTS[agent_key]
        self.model = os.getenv("CLAUDE_MODEL", "claude-sonnet-4-20250514")
        self._client = None
        self._memory_loaded = False

        if fresh_session:
            mem.clear_agent_history(agent_key)

    # ------------------------------------------------------------------
    # Internal helpers
    # ------------------------------------------------------------------

    def _get_client(self):
        if not ANTHROPIC_AVAILABLE:
            raise RuntimeError(
                "anthropic package not installed. Run: pip install anthropic"
            )
        if self._client is None:
            api_key = os.getenv("ANTHROPIC_API_KEY", "")
            if not api_key:
                raise RuntimeError(
                    "ANTHROPIC_API_KEY not set. Add it to your .env file."
                )
            self._client = anthropic.Anthropic(api_key=api_key)
        return self._client

    def _build_messages(self, user_message: str) -> list:
        """Build message list from history + current message."""
        history = mem.get_conversation_history(self.key, limit=20)
        messages = list(history)
        messages.append({"role": "user", "content": user_message})
        return messages

    def _system_with_memory_context(self) -> str:
        """Inject memory context summary into system prompt."""
        base = self.cfg["system"]
        recent = mem.get_recent_decisions(5)
        if not recent:
            return base
        lines = ["", "RECENT TEAM DECISIONS (from shared memory):"]
        for d in recent:
            lines.append(f"  [{d['agent']}] {d['decision']}")
        context = "\n".join(lines)
        return base + context

    # ------------------------------------------------------------------
    # Public API
    # ------------------------------------------------------------------

    def chat(self, user_message: str) -> str:
        """
        Send a message to this agent. Returns the agent's response string.
        Conversation history is persisted to memory automatically.
        """
        client = self._get_client()
        messages = self._build_messages(user_message)
        system = self._system_with_memory_context()

        response = client.messages.create(
            model=self.model,
            max_tokens=2048,
            system=system,
            messages=messages,
        )
        reply = response.content[0].text

        mem.append_conversation(self.key, "user", user_message)
        mem.append_conversation(self.key, "assistant", reply)

        return reply

    def deploy(
        self,
        repo_path: str,
        content: str,
        commit_message: str,
        wi_id: str = "",
    ) -> dict:
        """
        Deploy a file to the GitHub repository.
        Returns result dict with success, branch, sha, pr_url.
        """
        if not gh.is_configured():
            return {
                "success": False,
                "error": (
                    "GitHub not configured. Set GITHUB_TOKEN and GITHUB_REPO "
                    "in your .env file."
                ),
            }
        result = gh.commit_file(
            repo_path=repo_path,
            content=content,
            commit_message=commit_message,
            wi_id=wi_id,
            agent_key=self.key,
        )
        if result.get("success"):
            note = (
                f"Deployed {repo_path} "
                f"(branch: {result['branch']}, sha: {result['sha'][:8]})"
            )
            mem.log_decision(self.key, note, context=wi_id)
        return result

    def read_repo_file(self, repo_path: str) -> Optional[str]:
        """Read a file from the GitHub repo."""
        return gh.read_file(repo_path)

    def remember(self, key: str, value: str) -> None:
        """Store a named note in this agent's private memory."""
        mem.set_agent_note(self.key, key, value)

    def recall(self, key: str) -> Optional[str]:
        """Retrieve a named note from this agent's private memory."""
        return mem.get_agent_note(self.key, key)

    def log_decision(self, decision: str, context: str = "") -> None:
        """Log a decision to shared team memory."""
        mem.log_decision(self.key, decision, context)

    def update_wi_status(self, wi_id: str, status: str, note: str = "") -> None:
        """Update the in-memory status of a work item."""
        mem.update_work_item_state(wi_id, status, note)

    def memory_summary(self) -> str:
        """Return a text summary of this agent's memory state."""
        return mem.summarize_memory(self.key)

    def clear_history(self) -> None:
        """Clear conversation history (keeps notes)."""
        mem.clear_agent_history(self.key)

    # ------------------------------------------------------------------
    # Convenience properties
    # ------------------------------------------------------------------

    @property
    def handle(self) -> str:
        return self.cfg["handle"]

    @property
    def full_name(self) -> str:
        return self.cfg["full_name"]

    @property
    def color(self) -> str:
        return self.cfg.get("color", "white")

    def __repr__(self) -> str:
        return f"FDAgent({self.key!r})"
