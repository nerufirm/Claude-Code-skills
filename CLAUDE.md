# CLAUDE.md

This file provides guidance for AI assistants working in this repository.

## Project Overview

This is a **Claude Code Skills** repository — a collection of reusable skills, prompts, and configurations for use with [Claude Code](https://docs.anthropic.com/en/docs/claude-code), Anthropic's CLI tool for AI-assisted software development.

## Repository Structure

```
Claude-Code-skills/
├── CLAUDE.md          # This file — AI assistant guidance
└── README.md          # Project overview
```

This project is in its early stages. New skills and configuration files will be added over time.

## What Are Claude Code Skills?

Claude Code skills are custom slash commands and automation hooks that extend Claude Code's capabilities. They are typically defined as markdown files or configuration entries that Claude Code can invoke during development sessions.

## Development Conventions

### Git Workflow

- **Main branch**: `main`
- Feature branches follow the pattern: `claude/<description>-<id>`
- Write clear, descriptive commit messages
- Push with: `git push -u origin <branch-name>`

### File Naming

- Use lowercase with hyphens for file and directory names (e.g., `my-skill.md`)
- Skill files should have descriptive names that reflect their purpose

### Code Style

- Keep skill definitions concise and focused on a single purpose
- Include clear trigger conditions and usage instructions in each skill
- Use markdown formatting for skill documentation

## Adding a New Skill

1. Create a new file in the appropriate directory
2. Define the skill's trigger conditions, instructions, and any required tools
3. Test the skill locally with Claude Code
4. Commit and push to a feature branch

## Useful Commands

```bash
# Check repository status
git status

# View recent commits
git log --oneline -10
```
