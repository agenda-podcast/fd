# agents/github_client.py
# GitHub API integration for FD agents.
# Agents can read repo files, commit changes, create branches, and open PRs.
# Set REQUIRE_HUMAN_APPROVAL=false to allow direct pushes to main.
# FD Policy: ASCII-only, <= 500 lines.

import base64
import os
import time
from pathlib import Path
from typing import Optional

try:
    from github import Github, GithubException
    GITHUB_AVAILABLE = True
except ImportError:
    GITHUB_AVAILABLE = False


def _require_github() -> None:
    if not GITHUB_AVAILABLE:
        raise RuntimeError(
            "PyGithub not installed. Run: pip install PyGithub"
        )


def _get_client():
    _require_github()
    token = os.getenv("GITHUB_TOKEN", "")
    if not token:
        raise RuntimeError(
            "GITHUB_TOKEN not set. Add it to your .env file."
        )
    return Github(token)


def _get_repo(client=None):
    if client is None:
        client = _get_client()
    repo_name = os.getenv("GITHUB_REPO", "")
    if not repo_name:
        raise RuntimeError(
            "GITHUB_REPO not set (format: owner/repo-name)."
        )
    return client.get_repo(repo_name)


# ---------------------------------------------------------------------------
# Read operations
# ---------------------------------------------------------------------------

def read_file(repo_path: str) -> Optional[str]:
    """Read a file from the GitHub repo. Returns content or None."""
    try:
        repo = _get_repo()
        branch = os.getenv("GITHUB_DEFAULT_BRANCH", "main")
        contents = repo.get_contents(repo_path, ref=branch)
        raw = contents.decoded_content
        return raw.decode("ascii", errors="replace")
    except Exception:
        return None


def list_directory(repo_path: str) -> list:
    """List files in a repo directory. Returns list of path strings."""
    try:
        repo = _get_repo()
        branch = os.getenv("GITHUB_DEFAULT_BRANCH", "main")
        contents = repo.get_contents(repo_path, ref=branch)
        if isinstance(contents, list):
            return [c.path for c in contents]
        return [contents.path]
    except Exception:
        return []


# ---------------------------------------------------------------------------
# Write operations
# ---------------------------------------------------------------------------

def _branch_exists(repo, branch_name: str) -> bool:
    try:
        repo.get_branch(branch_name)
        return True
    except GithubException:
        return False


def _create_branch(repo, branch_name: str, from_branch: str) -> None:
    source = repo.get_branch(from_branch)
    repo.create_git_ref(
        ref=f"refs/heads/{branch_name}",
        sha=source.commit.sha,
    )


def commit_file(
    repo_path: str,
    content: str,
    commit_message: str,
    wi_id: str = "",
    agent_key: str = "",
) -> dict:
    """
    Commit a file to the repository.

    If REQUIRE_HUMAN_APPROVAL=false: commits directly to default branch.
    If REQUIRE_HUMAN_APPROVAL=true (default): commits to a feature branch
    and opens a PR.

    Returns a dict with keys: success, branch, pr_url (if PR created), sha.
    """
    require_approval = os.getenv("REQUIRE_HUMAN_APPROVAL", "true").lower() != "false"
    default_branch = os.getenv("GITHUB_DEFAULT_BRANCH", "main")

    repo = _get_repo()
    encoded = content.encode("ascii", errors="replace")
    encoded_str = encoded.decode("ascii")

    if require_approval:
        ts = int(time.time())
        safe_wi = wi_id.lower().replace(" ", "-") if wi_id else "agent"
        safe_agent = agent_key if agent_key else "agent"
        branch_name = f"agent/{safe_agent}/{safe_wi}-{ts}"

        if not _branch_exists(repo, branch_name):
            _create_branch(repo, branch_name, default_branch)

        target_branch = branch_name
    else:
        target_branch = default_branch

    # Check if file already exists
    try:
        existing = repo.get_contents(repo_path, ref=target_branch)
        result = repo.update_file(
            path=repo_path,
            message=commit_message,
            content=encoded_str,
            sha=existing.sha,
            branch=target_branch,
        )
        sha = result["commit"].sha
    except GithubException:
        result = repo.create_file(
            path=repo_path,
            message=commit_message,
            content=encoded_str,
            branch=target_branch,
        )
        sha = result["commit"].sha

    pr_url = ""
    if require_approval:
        pr_title = f"{wi_id}: {commit_message[:60]}" if wi_id else commit_message[:72]
        pr_body = (
            f"## Work Item Reference\n\n"
            f"Work Item ID: {wi_id}\n\n"
            f"## What Changed\n\n"
            f"Agent `@{agent_key}` committed: `{repo_path}`\n\n"
            f"Commit: {sha}\n\n"
            f"## Checklist\n\n"
            f"- [ ] AC mapping verified\n"
            f"- [ ] Evidence links included\n"
            f"- [ ] E2E updated if behavior change\n"
        )
        pr = repo.create_pull(
            title=pr_title,
            body=pr_body,
            head=branch_name,
            base=default_branch,
        )
        pr_url = pr.html_url

    return {
        "success": True,
        "branch": target_branch,
        "sha": sha,
        "pr_url": pr_url,
        "requires_review": require_approval,
    }


def get_open_prs(label: str = "") -> list:
    """Return list of open PRs, optionally filtered by label."""
    try:
        repo = _get_repo()
        prs = repo.get_pulls(state="open")
        result = []
        for pr in prs:
            if label:
                pr_labels = [lb.name for lb in pr.labels]
                if label not in pr_labels:
                    continue
            result.append({
                "number": pr.number,
                "title": pr.title,
                "url": pr.html_url,
                "branch": pr.head.ref,
            })
        return result
    except Exception:
        return []


def create_github_issue(
    title: str,
    body: str,
    labels: Optional[list] = None,
) -> dict:
    """Create a GitHub issue (useful for flagging defects)."""
    try:
        repo = _get_repo()
        issue = repo.create_issue(
            title=title,
            body=body,
            labels=labels or [],
        )
        return {"success": True, "url": issue.html_url, "number": issue.number}
    except Exception as e:
        return {"success": False, "error": str(e)}


def is_configured() -> bool:
    """Return True if GitHub env vars are set and client can connect."""
    if not GITHUB_AVAILABLE:
        return False
    try:
        repo = _get_repo()
        _ = repo.name
        return True
    except Exception:
        return False
