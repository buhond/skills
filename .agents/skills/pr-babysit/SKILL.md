---
name: pr-babysit
description: 'Watch an open pull request and keep it green until it merges: fix failing CI, resolve merge conflicts, and fix, reply to and resolve review comments. Use right after opening a PR, or when asked to babysit, watch, shepherd, or "get this PR merged".'
argument-hint: '[PR number or URL, default: current branch] [interval, default 10m] [once] [ready] [merge]'
---

# PR Babysit

Once a PR is open, own it until it merges or closes.

## Tooling

Use the PR tool the repo's docs or skills name (e.g. Delta at Shopify, Graphite `gt`); read its `--help` instead of guessing. Otherwise use MCP or tool gateway tools, then the host's CLI (`gh`). If the tool handles push, sync, or merge, go through it.

## Options

- `once`: run one check and stop. No watching; whoever called you decides when the next check runs.
- `ready`: mark a draft ready for review once it is green.
- `merge`: merge once it is ready (step 5).

Without `ready` or `merge`, do neither unless the user asks in the conversation.

## Watching

Find the PR once and check it now. Then, if the harness can deliver the PR's events (CI finished, new comment or review, new push to the base branch), subscribe and check on each event. Otherwise check every interval (default 10 minutes), with the harness's scheduler if it has one, else `sleep`. Stop when the PR is merged or closed, or the user says stop.

## Each check

1. **Sync**: work in a separate worktree on the PR's head branch, updated from the remote. Never touch the user's checkout.
2. **Conflicts**: bring in the base branch the way the repo does, keep the intent of both sides, run the affected tests, push.
3. **CI**: read the failing logs, fix the root cause, push. Retry a flaky, unrelated failure once; if it fails again, tell the user. Never skip or loosen a check.
4. **Review comments** (inline, review bodies, top-level, bots) whose latest reply isn't yours:
   - Makes sense: fix it, push, reply with the commit SHA, then resolve the thread.
   - Doesn't: reply with a short, polite reason and leave the thread for the reviewer.
   - Needs the user's call: ask them once, in one line with your recommendation, and skip it until they answer.

   Once you've addressed a review, re-request it from that reviewer.
5. **Ready** (approved, green, no conflicts, every thread answered): merge with `merge`; otherwise tell the user once and keep checking. Still a draft once green: mark it ready with `ready`; otherwise ask the user whether to.

## Guardrails

- Push only to the PR's branch, only changes in its scope, and never with plain `--force`.
- If a fix you tried still fails three checks later, stop and tell the user what you tried. Waiting on CI, reviewers, or the user isn't a blocker.
