#!/usr/bin/env python3
# fd-agent
# Root-level executable wrapper for the FD agent CLI.
# Run: python fd-agent [options]
# Or:  python -m agents.run_agent [options]
#
# First time setup:
#   pip install -r requirements.txt
#   cp config/.env.example .env
#   # Edit .env with your ANTHROPIC_API_KEY
#   python fd-agent --agent techlead

import sys
import os

sys.path.insert(0, os.path.dirname(__file__))

from agents.run_agent import main

if __name__ == "__main__":
    main()
