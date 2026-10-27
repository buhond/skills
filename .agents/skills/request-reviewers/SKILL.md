---
name: request-reviewers
description: 'Request the best reviewers for a pull request: owners of the touched code, never the author. Use when a PR needs reviewers, or when asked who should review it.'
argument-hint: '[PR number or URL, default: current branch]'
---

# Request Reviewers

Request one or two reviewers who own the code the PR touches.

1. Skip a draft, and a PR that already has reviewers.
2. Find the owners of the touched files: the ownership tool the repo's docs or skills name, else `CODEOWNERS`, else the most recent authors of those files (`git log --format='%an %ae' -- <files>`).
3. Prefer whoever owns the most of the diff. Never the author.
4. Request them with the repo's PR tool, else `gh pr edit --add-reviewer`.
