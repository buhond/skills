---
name: pr-description
description: Write a short, clear PR description — what changed and why — that a junior can read in a minute. Use when opening a PR or asked to write or improve a PR description.
---

# PR Description

Write the description a reviewer actually needs: **what we did** and **why**. Nothing else.

## Process

1. Read the change: `git diff origin/main...HEAD --stat` then the diff itself.
2. Find the why — the linked issue, the conversation, or ask the user if it isn't obvious.
3. Write the description with the template below.
4. If a PR already exists (`gh pr view`), update it with `gh pr edit --body-file`. Otherwise hand the text to the user.

## Template

```markdown
## What

<2-4 sentences: what this PR changes, in plain words.>

## Why

<1-3 sentences: the problem this solves, or the reason we want it.>

## Notes for the reviewer

<Optional. Only if there is a real trade-off, a risky spot, or a manual step to test.>
```

## Rules

- Simple words. A junior who has never seen this code should understand it.
- Describe behavior, not the diff. The reviewer can already read the code.
- One screen, max. If you need more, the PR is too big — split it.
- No file-by-file walkthrough, no "changes" checklist, no headings with nothing under them.
- Drop the "Notes" section when there is nothing to say. Never pad it.
- Never claim something is tested or verified unless you ran it.
