---
name: pr-description
description: Write a short, clear PR description — what changed and why, in plain words. Use when opening a PR or asked to write or improve a PR description.
---

# PR Description

Write the description a reviewer actually needs: **what we did** and **why**. Nothing else.

## Process

1. Read the change: `git diff origin/main...HEAD --stat` then the diff itself.
2. Dig out the why yourself — the linked issue, the conversation, the commit messages, `git log` on the surrounding code. Don't ask the user.
3. Write the description with the template below.
4. If a PR already exists (`gh pr view`), update it with `gh pr edit --body-file`. Otherwise hand the text to the user.

## Sections

- `## What` — 2-4 sentences on what this PR changes.
- `## Why` — 1-3 sentences on the problem it solves.
- `## Notes for the reviewer` — only if there's a real trade-off, a risky spot, or a manual step to test.

## Rules

- Simple words. A junior who has never seen this code should understand it.
- Describe behavior, not the diff. The reviewer can already read the code.
- One screen, max. Describing a big PR is still the job — summarize it, don't propose splitting it.
- No file-by-file walkthrough, no "changes" checklist, no headings with nothing under them.
- Drop the "Notes" section when there is nothing to say. Never pad it.
- Never claim something is tested or verified unless you ran it.
- When the why still isn't clear after looking, write your best reading of it and say it's your reading. Don't stop to ask.
