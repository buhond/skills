---
name: linear-ticket-pr
description: Create a Linear issue for the current local change set, place it under the best matching active project, then create the corresponding branch and draft PR named from the Linear issue key. Use when the user wants to turn work that is not on `origin/main` into a tracked Linear ticket plus a GitHub-ready branch and PR, especially when the title should start with the issue key such as `GENG-1234 - Fix something`.
---

# Linear Ticket PR

## Overview

Turn the current local diff into one coherent unit of work with a Linear issue, an issue-keyed branch, and a draft PR. Derive the scope from changes that are not on `origin/main`, prefer the correct active Linear project when there is a clear fit, and keep the same issue key in the branch, commit, and PR title.

## Workflow

1. Define the scope from local work that is not on `origin/main`.
   - Run `git status --short --branch`.
   - Run `git diff --stat origin/main...HEAD` to capture committed work not on `origin/main`.
   - Run `git diff --stat HEAD` to capture tracked staged and unstaged worktree changes.
   - Run `git ls-files --others --exclude-standard` to capture untracked files.
   - Treat the union of those changes as the candidate scope.
   - Stop and ask the user to split the work if the diff contains more than one unrelated concern.
   - Stop if there is no work beyond `origin/main`.

2. Infer the owning Linear team and project.
   - Determine the subsystem or initiative from the touched paths and the diff summary.
   - Use Linear to read teams and active projects before creating anything.
   - Prefer the active project whose name, description, or scope clearly matches the work.
   - If multiple projects fit equally well, ask the user instead of guessing.
   - If there is no clear project, create the issue under the correct team without forcing a project.

3. Create the Linear issue.
   - Write a concise user-facing title that describes the behavior change, not the implementation detail.
   - Write a description with:
     - root cause or motivation
     - intended fix
     - touched areas
     - validation plan
   - Capture the created issue key exactly as returned, for example `GENG-1234`.

4. Create or normalize the branch name from the issue key.
   - If the current branch is a default branch such as `main` or `master`, create a new branch.
   - Use `dim/<lowercased-issue-key>-<short-slug>`, for example `dim/geng-1234-fix-field-configuration-select`.
   - If already on a feature branch, rename it to that pattern when safe.
   - Keep the slug short, specific, and free of filler words.

5. Publish with the same issue key.
   - Stage only the files that belong to the issue.
   - Commit with `<ISSUE_KEY> - <title>`.
   - Push the branch.
   - Open a draft PR with title `<ISSUE_KEY> - <title>`.
   - Reference the Linear issue in the PR body and summarize root cause, fix, and validation.
   - Prefer the GitHub connector for PR creation and fall back to `gh` only when necessary.

## Guardrails

- Do not create a ticket, branch, or PR for mixed unrelated changes.
- Do not guess a Linear project when the best match is ambiguous.
- Do not use a lowercase issue key in the commit or PR title; keep the canonical uppercase key from Linear.
- Do not create duplicate artifacts when a branch or PR already exists for the same issue key; update the existing artifact instead.
- Do not widen the scope to include files that are already on `origin/main` or unrelated local edits.

## Example Requests

- `Use $linear-ticket-pr to create the right Linear ticket for my current local changes, then create the branch and draft PR.`
- `Use $linear-ticket-pr to turn everything not on origin/main into a GENG ticket and a PR titled from that ticket.`
