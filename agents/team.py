# agents/team.py
# FDTeam: multi-agent orchestrator for FAVELLA DEVELOPMENT.
# Broadcasts messages to all or selected agents, collects responses.
# FD Policy: ASCII-only, <= 500 lines.

import concurrent.futures
import os
from typing import Dict, List, Optional

from agents.config import AGENTS
from agents.base_agent import FDAgent
from agents import memory as mem


class FDTeam:
    """
    Multi-agent orchestrator for FD.

    Usage:
        team = FDTeam()
        results = team.broadcast("What are your deliverables for WI-001?")
        for handle, response in results.items():
            print(f"{handle}: {response}")

    Or target specific agents:
        results = team.broadcast("Review this PR.", agents=["reviewer", "qa"])
    """

    def __init__(self, max_workers: int = 5):
        self.max_workers = max_workers
        self._agents: Dict[str, FDAgent] = {}

    def _get_agent(self, key: str) -> FDAgent:
        if key not in self._agents:
            self._agents[key] = FDAgent(key)
        return self._agents[key]

    def broadcast(
        self,
        message: str,
        agents: Optional[List[str]] = None,
    ) -> Dict[str, str]:
        """
        Send a message to multiple agents concurrently.
        Returns dict of agent_key -> response string.
        Errors are captured as error strings rather than raising.
        """
        target_keys = agents if agents else list(AGENTS.keys())
        invalid = [k for k in target_keys if k not in AGENTS]
        if invalid:
            raise ValueError(f"Unknown agent keys: {invalid}")

        results: Dict[str, str] = {}

        def call_one(key: str):
            try:
                agent = self._get_agent(key)
                return key, agent.chat(message)
            except Exception as e:
                return key, f"[ERROR from {key}]: {e}"

        with concurrent.futures.ThreadPoolExecutor(
            max_workers=min(self.max_workers, len(target_keys))
        ) as executor:
            futures = {executor.submit(call_one, k): k for k in target_keys}
            for future in concurrent.futures.as_completed(futures):
                key, response = future.result()
                results[key] = response

        return results

    def handoff(
        self,
        message: str,
        producer: str,
        receiver: str,
    ) -> Dict[str, str]:
        """
        Simulate a 1-to-1 handoff: producer generates output,
        receiver reviews and responds.
        Returns dict with producer and receiver responses.
        """
        if producer not in AGENTS:
            raise ValueError(f"Unknown producer: {producer}")
        if receiver not in AGENTS:
            raise ValueError(f"Unknown receiver: {receiver}")

        producer_agent = self._get_agent(producer)
        producer_response = producer_agent.chat(message)

        mem.log_decision(
            producer,
            f"Handoff to {receiver}: {message[:60]}",
            context="handoff",
        )

        receiver_prompt = (
            f"You are receiving a handoff from @{producer} "
            f"({AGENTS[producer]['full_name']}).\n\n"
            f"Their output:\n\n{producer_response}\n\n"
            f"Please review this in your role as {AGENTS[receiver]['full_name']} "
            f"and respond with your assessment, questions, or next actions."
        )
        receiver_agent = self._get_agent(receiver)
        receiver_response = receiver_agent.chat(receiver_prompt)

        return {
            producer: producer_response,
            receiver: receiver_response,
        }

    def team_deploy(
        self,
        repo_path: str,
        content: str,
        commit_message: str,
        wi_id: str = "",
        deploying_agent: str = "devops",
    ) -> dict:
        """
        Deploy a file to GitHub using a specific agent's deploy method.
        Logs the action to shared team memory.
        """
        if deploying_agent not in AGENTS:
            raise ValueError(f"Unknown deploying agent: {deploying_agent}")
        agent = self._get_agent(deploying_agent)
        result = agent.deploy(
            repo_path=repo_path,
            content=content,
            commit_message=commit_message,
            wi_id=wi_id,
        )
        if result.get("success"):
            mem.log_decision(
                deploying_agent,
                f"Team deploy: {repo_path} for {wi_id}",
                context=commit_message,
            )
        return result

    def status(self) -> Dict[str, dict]:
        """Return memory status for all agents."""
        statuses = {}
        for key in AGENTS:
            agent_mem = mem.load_agent_memory(key)
            statuses[key] = {
                "handle": AGENTS[key]["handle"],
                "last_active": agent_mem.get("last_active", "never"),
                "history_turns": len(agent_mem.get("history", [])),
                "notes_count": len(agent_mem.get("notes", {})),
            }
        return statuses

    def reset_agent(self, agent_key: str) -> None:
        """Clear history for one agent and remove its cached instance."""
        mem.clear_agent_history(agent_key)
        self._agents.pop(agent_key, None)

    def reset_all(self) -> None:
        """Clear history for all agents."""
        for key in AGENTS:
            mem.clear_agent_history(key)
        self._agents.clear()
