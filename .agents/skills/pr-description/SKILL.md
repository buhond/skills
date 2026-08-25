---
name: pr-description
description: Write a short, clear PR description — what changed and why, in plain words. Use when opening a PR or asked to write or improve a PR description.
---

# PR Description

Three sections, in plain words a junior can follow:

- `## What` — 2-4 sentences on what this PR changes. Describe behavior, not the diff; the reviewer can read the code.
- `## Why` — 1-3 sentences on the problem it solves.
- `## Notes for the reviewer` — only for a real trade-off, a risky spot, or a manual test step. Otherwise leave it out.

Find the why yourself — the linked issue, the conversation, `git log`. Don't ask the user; when it's still unclear, write your best reading and say it's your reading.

Never claim something is tested unless you ran it.

Update an existing PR with `gh pr edit --body-file`.
