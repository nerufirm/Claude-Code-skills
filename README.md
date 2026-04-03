# My Claude Code Skills

A collection of custom slash command skills for [Claude Code](https://docs.anthropic.com/en/docs/claude-code).

## Available Skills

### `/review` — Code Review

Reviews your current git diff (staged and unstaged) for common issues across four categories:

- **Bugs** — logic errors, null access, race conditions
- **Security** — injection vulnerabilities, hardcoded secrets
- **Performance** — unnecessary loops, large allocations
- **Style** — dead code, inconsistent naming

Usage: type `/review` in a Claude Code session with uncommitted changes.

## Installation

Clone this repo and the `.claude/commands/` directory will make the skills available in Claude Code when working within this project. To make them available globally, copy the command files to `~/.claude/commands/`.
