---
name: pr-description
description: Write a short, clear pull request description — what changed and why, in plain words. Use when opening a PR, or when asked to write, rewrite, or improve a PR description or body.
---

# PR Description

Three sections, 1-3 sentences each, in plain words a junior can follow:

- `## What` — what this PR changes. Describe behavior, not the diff; the reviewer can read the code.
- `## Why` — the problem it solves.
- `## Notes for the reviewer` — only for a real trade-off, a risky spot, or a manual test step. Otherwise leave it out.

Find the why yourself — the linked issue, the conversation, `git log`. Don't ask the user; when it's still unclear, write your best reading and say it's your reading.

Only claim what you verified.

When you open the PR, assign it to the thread's owner, never to the PR's author, a bot or someone else named in the request.

Update an existing PR with `gh pr edit --body-file`.
