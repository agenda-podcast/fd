# FAVELLA DEVELOPMENT

Version: 1.0.0
FD-Only Rule: This repository contains only FAVELLA DEVELOPMENT content.

---

## Quick Start (GitHub Pages only)

1. Push this repo to GitHub.
2. Settings > Pages > Source > Deploy from branch > `main` > `/docs` > Save.
3. Open the published URL. Documentation and AI Chat are live.

---

## Quick Start (AI Agents CLI)

```bash
# 1. Install dependencies
pip install -r requirements.txt

# 2. Configure environment
cp config/.env.example .env
# Edit .env: add ANTHROPIC_API_KEY (required)
# Edit .env: add GITHUB_TOKEN + GITHUB_REPO (required only for deploy)

# 3. Chat with a single agent (interactive)
python fd-agent.py --agent techlead

# 4. One-shot message
python fd-agent.py --agent pm --message "Decompose MS-000 into atomic WIs"

# 5. Team broadcast (all 10 agents respond)
python fd-agent.py --team --message "What are your deliverables for WI-001?"

# 6. Targeted team (subset of agents)
python fd-agent.py --team --agents "reviewer,qa" --message "Review this approach"

# 7. 1-to-1 handoff simulation
python fd-agent.py --handoff pm techlead --message "Plan implementation for MS-000"

# 8. Deploy a file to GitHub via agent
python fd-agent.py --agent devops --deploy docs/index.html \
  --message "WI-001: Update GitHub Pages UI" --wi WI-001

# 9. Check agent memory
python fd-agent.py --agent techlead --memory

# 10. Team status dashboard
python fd-agent.py --team --status
```

---

## Repository Structure

```
/agents              Python agent executables
  __init__.py        Package init (FDAgent, FDTeam exports)
  config.py          Agent metadata and system prompts (10 roles)
  memory.py          Read/write persistent memory (JSON)
  github_client.py   GitHub API: commit, branch, PR, issue
  base_agent.py      FDAgent class: chat, deploy, remember
  team.py            FDTeam class: broadcast, handoff, status
  run_agent.py       CLI entrypoint (argparse)

/memory              Persistent agent memory (gitignored by default)
  README.md          Memory schema and rules
  agents/            Per-agent private JSON stores
  shared/            Cross-agent shared stores (decisions, work_items)

/config              Configuration files
  .env.example       Environment variable template

/docs                GitHub Pages UI + canonical documentation
  index.html         Single-page app: nav, templates, AI Chat (10 agents)
  FD_DOCUMENTATION.md  Operating model
  WI_TEMPLATE.md     Work Item template
  MILESTONE_TEMPLATE.md  Milestone template
  E2E_VERIFICATION.md   E2E scenarios and regression matrix
  RELEASE_RUNBOOK.md    Release checklist and rollback procedure

/backlog             Work items and milestones (versioned)
/evidence            Evidence packs per WI
/src                 FD product code (empty until feature WIs ship)
/tools               CI enforcement scripts (4 bash scripts)
/.github             CI/CD workflows and PR template
```

---

## Agent Roster

| Handle      | Role                   | Key Deliverables                            |
|-------------|------------------------|---------------------------------------------|
| @owner      | Owner / Founder        | Milestone Intent Brief, Acceptance Memo     |
| @pm         | Product Manager        | WI decomposition, AC quality control        |
| @ux         | UX Designer            | UI specs, wireframes, content IA            |
| @techlead   | Tech Lead              | Approach notes, implementation plan, NFRs   |
| @fe         | Frontend Engineer      | GitHub Pages UI, HTML/CSS/JS, PRs           |
| @be         | Backend Engineer       | CI scripts, agent code, data schemas        |
| @devops     | DevOps                 | CI/CD workflows, deploy runbook, rollback   |
| @reviewer   | Code Reviewer          | PR decisions, review checklist, merge       |
| @qa         | QA Lead                | E2E verification, regression, Accepted      |
| @release    | Release Manager        | Release execution record, runbook           |

---

## Deploy Modes

Agents deploy via the GitHub API (agents/github_client.py).

| REQUIRE_HUMAN_APPROVAL | Behavior                                          |
|------------------------|---------------------------------------------------|
| true (default)         | Agent commits to feature branch, opens a PR       |
| false                  | Agent commits directly to main (autonomous mode)  |

Set in .env:
  REQUIRE_HUMAN_APPROVAL=false

---

## CI Checks (5 jobs on every push and PR)

1. Policy Checks - 500-line limit, ASCII-only, required files present
2. Agent Syntax - all Python files compile without errors
3. WI Reference - WI IDs in PR title/body exist in /backlog/ (PRs only)
4. E2E Update - E2E_VERIFICATION.md updated if behavior-change label (PRs only)
5. Pages Smoke - docs/index.html loads and nav sections are present

Run locally:
  bash tools/check_line_limit.sh .
  bash tools/check_ascii.sh .
  bash tools/check_required_docs.sh
  python3 -m py_compile agents/*.py fd-agent.py

---

## FD-Only Rule

This repository must not contain content from other products.
If content is not clearly FAVELLA DEVELOPMENT, it does not belong here.
