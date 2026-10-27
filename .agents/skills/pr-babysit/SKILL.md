---
name: pr-babysit
description: 'Watch an open pull request on a schedule and keep it green until it merges: fix failing CI, resolve merge conflicts, and fix, reply to and resolve review comments. Use right after opening a PR, or when asked to babysit, watch, shepherd, or "get this PR merged".'
argument-hint: '[PR number or URL, default: current branch] [interval, default 30m]'
---

# PR Babysit

Once a PR is open, own it until it merges or closes.

## Tooling

Use the PR tool the repo's docs or skills name (e.g. Delta at Shopify, Graphite `gt`); read its `--help` instead of guessing. Otherwise use MCP or tool gateway tools, then the host's CLI (`gh`). If the tool handles push, sync, or merge, go through it.

## Schedule

Find the PR once, then check it by number or URL now and every interval (default 30 minutes), using the harness's scheduler if it has one, else `sleep`. Stop when the PR is merged or closed, or the user says stop.

## Each check

1. **Sync**: work in a separate worktree on the PR's head branch, updated from the remote. Never touch the user's checkout.
2. **Conflicts**: bring in the base branch the way the repo does, keep the intent of both sides, run the affected tests, push.
3. **CI**: read the failing logs, fix the root cause, push. Retry a flaky, unrelated failure once; if it fails again, tell the user. Never skip or loosen a check.
4. **Review comments** (inline, review bodies, top-level, bots) whose latest reply isn't yours:
   - Makes sense: fix it, push, reply with the commit SHA, then resolve the thread.
   - Doesn't: reply with a short, polite reason and leave the thread for the reviewer.
   - Needs the user's call: ask them once, in one line with your recommendation, and skip it until they answer.

   Once you've addressed a review, re-request it from that reviewer.
5. **Ready** (approved, green, no conflicts, every thread answered): merge only if the user asked; otherwise tell them once and keep checking. Still a draft once green: ask the user whether to mark it ready.

## Guardrails

- Push only to the PR's branch, only changes in its scope, and never with plain `--force`.
- If a fix you tried still fails three checks later, stop and tell the user what you tried. Waiting on CI, reviewers, or the user isn't a blocker.
