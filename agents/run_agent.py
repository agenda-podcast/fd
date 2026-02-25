#!/usr/bin/env python3
# agents/run_agent.py
# CLI entrypoint for FAVELLA DEVELOPMENT agents.
#
# Usage examples:
#   python -m agents.run_agent --agent techlead
#   python -m agents.run_agent --agent techlead --message "Plan WI-002"
#   python -m agents.run_agent --team --message "Review MS-001 scope"
#   python -m agents.run_agent --agent qa --deploy docs/E2E_VERIFICATION.md --wi WI-001
#   python -m agents.run_agent --agent techlead --memory
#   python -m agents.run_agent --team --status
#   python -m agents.run_agent --handoff pm techlead --message "Decompose MS-001"
#
# FD Policy: ASCII-only, <= 500 lines.

import argparse
import os
import sys
from pathlib import Path


def _setup_path():
    repo_root = Path(__file__).parent.parent
    if str(repo_root) not in sys.path:
        sys.path.insert(0, str(repo_root))


_setup_path()


def _load_env():
    try:
        from dotenv import load_dotenv
        env_path = Path(__file__).parent.parent / ".env"
        load_dotenv(dotenv_path=env_path)
    except ImportError:
        pass


_load_env()


def _console():
    """Return a Rich Console or a fallback plain printer."""
    try:
        from rich.console import Console
        return Console()
    except ImportError:
        return None


def _print(console, text: str, style: str = ""):
    if console:
        console.print(text, style=style)
    else:
        print(text)


def _rule(console, title: str = ""):
    if console:
        from rich.rule import Rule
        console.print(Rule(title))
    else:
        print("-" * 60 + (f" {title}" if title else ""))


def _panel(console, content: str, title: str = "", color: str = "cyan"):
    if console:
        from rich.panel import Panel
        console.print(Panel(content, title=title, border_style=color))
    else:
        print(f"[{title}]\n{content}\n")


def cmd_single_agent(args):
    """Chat with or command a single agent."""
    from agents.config import AGENTS
    from agents.base_agent import FDAgent

    console = _console()

    if args.agent not in AGENTS:
        _print(console, f"[ERROR] Unknown agent: {args.agent}", "red")
        _print(console, f"Valid agents: {', '.join(AGENTS.keys())}", "dim")
        sys.exit(1)

    agent = FDAgent(args.agent, fresh_session=args.fresh)
    cfg = AGENTS[args.agent]

    if args.memory:
        summary = agent.memory_summary()
        _panel(console, summary, title=f"Memory: {cfg['handle']}", color="blue")
        return

    if args.clear_memory:
        agent.clear_history()
        _print(console, f"History cleared for {cfg['handle']}.", "green")
        return

    if args.deploy and args.message:
        content_path = Path(args.deploy)
        if content_path.exists():
            content = content_path.read_text(encoding="ascii", errors="replace")
            repo_path = args.deploy
        else:
            _print(console, f"[ERROR] File not found: {args.deploy}", "red")
            sys.exit(1)
        wi_id = args.wi or ""
        result = agent.deploy(
            repo_path=repo_path,
            content=content,
            commit_message=args.message,
            wi_id=wi_id,
        )
        if result.get("success"):
            _print(console, f"[OK] Deployed {repo_path}", "green")
            _print(console, f"     Branch: {result['branch']}", "dim")
            _print(console, f"     SHA: {result['sha'][:12]}", "dim")
            if result.get("pr_url"):
                _print(console, f"     PR: {result['pr_url']}", "cyan")
        else:
            _print(console, f"[FAIL] {result.get('error', 'Unknown error')}", "red")
        return

    if args.message:
        _rule(console, f"{cfg['handle']} - {cfg['full_name']}")
        response = agent.chat(args.message)
        _panel(console, response, title=cfg["handle"], color=cfg.get("color", "cyan"))
        return

    # Interactive mode
    _rule(console, f"FD Agent: {cfg['handle']} - {cfg['full_name']}")
    _print(console, "Type your message and press Enter. Type 'exit' to quit.", "dim")
    _print(console, "Commands: /memory  /clear  /deploy <path> [wi=WI-###]", "dim")
    _rule(console)

    while True:
        try:
            user_input = input(f"You > ").strip()
        except (EOFError, KeyboardInterrupt):
            _print(console, "\nExiting.", "dim")
            break

        if not user_input:
            continue

        if user_input.lower() in ("exit", "quit", "q"):
            break

        if user_input == "/memory":
            _panel(console, agent.memory_summary(), title="Memory", color="blue")
            continue

        if user_input == "/clear":
            agent.clear_history()
            _print(console, "History cleared.", "green")
            continue

        if user_input.startswith("/deploy "):
            parts = user_input.split()
            if len(parts) < 2:
                _print(console, "Usage: /deploy <local-file-path> [wi=WI-###]", "red")
                continue
            file_path = parts[1]
            wi_id = ""
            for p in parts[2:]:
                if p.startswith("wi="):
                    wi_id = p[3:]
            if not Path(file_path).exists():
                _print(console, f"File not found: {file_path}", "red")
                continue
            content = Path(file_path).read_text(encoding="ascii", errors="replace")
            commit_msg = input("Commit message: ").strip() or f"Deploy {file_path}"
            result = agent.deploy(file_path, content, commit_msg, wi_id)
            if result.get("success"):
                _print(console, f"[OK] {result['branch']} sha={result['sha'][:8]}", "green")
                if result.get("pr_url"):
                    _print(console, f"PR: {result['pr_url']}", "cyan")
            else:
                _print(console, f"[FAIL] {result.get('error')}", "red")
            continue

        response = agent.chat(user_input)
        _panel(console, response, title=cfg["handle"], color=cfg.get("color", "cyan"))


def cmd_team(args):
    """Broadcast to all agents or run team operations."""
    from agents.config import AGENTS
    from agents.team import FDTeam

    console = _console()
    team = FDTeam()

    if args.status:
        statuses = team.status()
        lines = []
        for key, s in statuses.items():
            lines.append(
                f"{s['handle']:<14} last={s['last_active'] or 'never':<22} "
                f"turns={s['history_turns']:<4} notes={s['notes_count']}"
            )
        _panel(console, "\n".join(lines), title="Team Status", color="yellow")
        return

    if not args.message:
        _print(console, "[ERROR] --message required for team broadcast.", "red")
        sys.exit(1)

    filter_agents = None
    if args.agents:
        filter_agents = [a.strip() for a in args.agents.split(",")]

    _rule(console, "FD Team Broadcast")
    _print(console, f"Message: {args.message}", "dim")
    _rule(console)

    results = team.broadcast(args.message, agents=filter_agents)

    for key, response in results.items():
        cfg = AGENTS[key]
        _panel(console, response, title=cfg["handle"], color=cfg.get("color", "cyan"))


def cmd_handoff(args):
    """Simulate a 1-to-1 handoff between two roles."""
    from agents.config import AGENTS
    from agents.team import FDTeam

    console = _console()

    if len(args.handoff) != 2:
        _print(console, "[ERROR] --handoff requires exactly two agent keys.", "red")
        sys.exit(1)

    producer, receiver = args.handoff
    team = FDTeam()

    _rule(console, f"Handoff: {producer} -> {receiver}")
    results = team.handoff(args.message, producer, receiver)

    for agent_key, response in results.items():
        cfg = AGENTS[agent_key]
        _panel(console, response, title=cfg["handle"], color=cfg.get("color", "cyan"))


def main():
    parser = argparse.ArgumentParser(
        prog="fd-agent",
        description="FAVELLA DEVELOPMENT AI Agent CLI",
    )

    parser.add_argument("--agent", metavar="KEY",
        help="Agent to chat with (e.g. techlead, qa, pm)")
    parser.add_argument("--team", action="store_true",
        help="Broadcast to all agents (team mode)")
    parser.add_argument("--handoff", nargs=2, metavar=("PRODUCER", "RECEIVER"),
        help="Simulate 1-to-1 handoff (e.g. --handoff pm techlead)")
    parser.add_argument("--message", "-m", metavar="MSG",
        help="Message to send")
    parser.add_argument("--agents", metavar="a,b,c",
        help="Comma-separated agent keys to target in team mode")
    parser.add_argument("--deploy", metavar="FILE",
        help="Local file path to deploy to GitHub (use with --message for commit msg)")
    parser.add_argument("--wi", metavar="WI-###",
        help="Work Item ID to associate with this action")
    parser.add_argument("--memory", action="store_true",
        help="Show memory summary for the agent")
    parser.add_argument("--clear-memory", action="store_true",
        help="Clear conversation history for the agent")
    parser.add_argument("--fresh", action="store_true",
        help="Start a fresh session (clears history before chatting)")
    parser.add_argument("--status", action="store_true",
        help="Show status of all agents (use with --team)")

    args = parser.parse_args()

    if args.handoff:
        if not args.message:
            parser.error("--handoff requires --message")
        cmd_handoff(args)
    elif args.team:
        cmd_team(args)
    elif args.agent:
        cmd_single_agent(args)
    else:
        parser.print_help()
        sys.exit(0)


if __name__ == "__main__":
    main()
