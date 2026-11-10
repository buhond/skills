---
name: pr-babysit
description: 'Watch an open pull request and keep it green until it merges: fix failing CI, resolve merge conflicts, and fix, reply to and resolve review comments. Use right after opening a PR, or when asked to babysit, watch, shepherd, or "get this PR merged".'
argument-hint: '[PR number or URL, default: current branch] [interval, default 10m] [ready] [merge]'
---

# PR Babysit

Once a PR is open, own it until it merges or closes.

## Tooling

Use the PR tool the repo's docs or skills name (e.g. Delta at Shopify, Graphite `gt`); read its `--help` instead of guessing. Otherwise use MCP or tool gateway tools, then the host's CLI (`gh`). If the tool handles push, sync, or merge, go through it.

## Options

- `ready`: mark a draft ready for review only once its work is done: CI passed, no conflicts, every review thread answered and nothing else still pushing to the branch (another agent, such as a tribunal run).
- `merge`: merge once it is ready (step 5).

Without `ready` or `merge`, do neither unless the user asks in the conversation.

## Watching

Find the PR once and check it now. Then, if the harness can deliver the PR's events (CI finished, new comment or review, new push to the base branch), subscribe and check on each event. Otherwise check every interval (default 10 minutes), with the harness's scheduler if it has one, else `sleep`. Stop when the PR is merged or closed, or the user says stop.

## Each check

1. **Sync**: work in a separate worktree on the PR's head branch, updated from the remote. Never touch the user's checkout.
2. **Conflicts, or a branch behind base**: merge the base branch into the PR's own branch the way the repo does, keep the intent of both sides, run the affected tests, push. If `package.json` `version` conflicts, keep the PR's version.
3. **CI**: read the failing logs, fix the root cause, push. A flaky or infra failure: re-trigger CI (rerun the job, or the repo's CI command), up to 3 times. Never skip or loosen a check.
4. **Review comments** (inline, review bodies, top-level, bots) whose latest reply isn't yours:
   - Makes sense: fix it, push, reply with the commit SHA, then resolve the thread.
   - Doesn't: reply with a short, polite reason. Resolve the thread when the reviewer is a bot; leave it for a person.
   - Unsure: follow the `decide` skill, act on your recommendation, and say what you chose in the reply. Ask the user only when the choice is genuinely theirs: once, in one line with your recommendation, and skip it until they answer.

   Once you've addressed a review, re-request it from that reviewer.
5. **Ready** (approved, green, no conflicts, every thread answered): merge with `merge`. Anything else missing is yours to fix (steps 2–4), not to report. The one exception: a missing human review — tell the user once whom to ask (owners or recent reviewers of the touched code, e.g. `git log`, CODEOWNERS) and keep checking. Still a draft once its work is done (CI passed, no conflicts, every thread answered, nothing else still pushing to the branch, such as a tribunal run): mark it ready with `ready`; otherwise ask the user whether to.

## Guardrails

- Push only to the PR's branch, only changes in its scope. Never with plain `--force`; if a force is unavoidable, `--force-with-lease=<branch>:<sha>`. Never `dt submit --stack`, never push a parent branch (merging the base branch in needs no force).
- A fix that still fails three checks later: try a different one. Never report blocked for anything fixable. A truly external block you may report only after trying everything, saying what you tried. Waiting on CI or reviewers isn't a blocker.
