---
name: ticket-pr
description: "Create an issue and matching PR. Default to GitHub Issues: `#<issue number> - <title>`"
---

# Ticket PR

Create an issue for the change, then publish the matching PR through the repository's normal workflow.

## Workflow

1. Scope the change.
   - Run `git status` and diff against `origin/main` to see all local work.
   - List the exact files that belong to this change; set everything else aside.
2. Find or create the issue.
   - Check for an existing issue or PR for the same change and reuse it.
   - Use the repository's existing issue system and key format when clear; otherwise create a GitHub Issue.
   - In the issue, clearly describe what we're trying to achieve and why — the goal, not the implementation.
3. Publish the PR.
   - Stage only the scoped files by path (never `git add -A` or `git add .`); leave pre-existing local modifications uncommitted.
   - Start the PR title with the issue key. For GitHub, use `#<issue number> - <title>`.
   - In the PR description, clearly describe the technical approach — how the change achieves what the issue asks for.

## Guardrails

- Do not invent an issue key or number.
- Do not create duplicate issues or PRs.
- Do not publish without the user's request.
- Write the issue and PR descriptions in simple words a five-year-old can understand.
