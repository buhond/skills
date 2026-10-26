---
name: pr-babysit
description: 'Watch an open pull request on a schedule and keep it moving until it merges: fix failing CI, address and reply to review comments, resolve merge conflicts, and request the right reviewers. Use right after opening a PR, or when asked to babysit, watch, shepherd, or "get this PR merged".'
argument-hint: '[PR number or URL, default: current branch] [interval, default 10m]'
---

# PR Babysit

Once a PR is open, own it until it merges or closes.

## Tooling

Use the repo's own PR tool (e.g. Delta at Shopify, Graphite `gt`), found through repo docs, skills, or `PATH`; read its `--help` instead of guessing. Otherwise use MCP or tool gateway tools, then the host's CLI (`gh`). If the tool handles push, sync, or merge, go through it.

## Schedule

Check now, then every interval (default 10 minutes), using the harness's scheduler if it has one, else `sleep`. Stop when the PR is merged or closed, or the user says stop.

## Each check

1. **Sync** the PR's head branch. If unrelated local changes are in the way, use a worktree; never stash or discard the user's work.
2. **Conflicts**: bring in the base branch the way the repo does, keep the intent of both sides, run the affected tests, push. Never plain `--force`.
3. **CI**: read the failing logs, fix the root cause, push. Retry a flaky, unrelated failure once; if it fails again, tell the user. Never skip or loosen a check.
4. **Review comments** (inline, review bodies, top-level, bots), skipping those you already answered last:
   - Makes sense: fix it and reply with the commit SHA.
   - Doesn't: reply with a short, polite reason.
   - Needs the user's call: ask them in one line with your recommendation.
   Reply in the thread; let the reviewer resolve it.
5. **Reviewers**: if none yet, request one or two owners of the touched code, from `CODEOWNERS` or an ownership tool, else recent authors of the files. Never the author.
6. **Ready** (approved, green, no conflicts, no open threads): merge only if the user asked; otherwise tell them once and keep checking.

## Guardrails

- Push only to the PR's branch, and only changes in its scope.
- If the same blocker survives three checks, stop and tell the user what you tried.
- Say "fixed in <sha>" only after the push.
