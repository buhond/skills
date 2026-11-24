---
name: pr-babysit
description: 'Watch an open pull request and keep it green until it merges: fix failing CI, resolve merge conflicts, and fix, reply to and resolve review comments. Use right after opening a PR, or when asked to babysit, watch, shepherd, or "get this PR merged".'
argument-hint: '[PR number or URL, default: current branch] [interval, default 10m] [ready] [merge]'
---

# PR Babysit

Once a PR is open, own it until it merges or closes.

## Tooling

Use the PR tool the repo's docs or skills name (e.g. Delta at Shopify, Graphite `gt`); read its `--help` instead of guessing. Otherwise use MCP or tool gateway tools, then the host's CLI (`gh`). If the tool handles push, sync, or merge, go through it, within step 2 and the guardrails.

## Options

- `ready`: mark a draft ready for review only once its work is done: CI passed, no conflicts, every review thread answered and nothing else still pushing to the branch (another agent, such as a tribunal run).
- `merge`: merge once it is ready (step 5).

Without `ready` or `merge`, do neither unless the user asks in the conversation.

## Watching

Find the PR once and check it now. Then, if the harness can deliver the PR's events (CI finished, new comment or review, new push to the base branch), subscribe and check on each event. Otherwise check every interval (default 10 minutes), with the harness's scheduler. Never `sleep` or poll in a shell to wait: it blocks the turn, so messages and events queue behind it. If there's no scheduler, end the turn. Stop when the PR is merged or closed, or the user says stop.

## Each check

1. **Sync**: work in a separate worktree on the PR's head branch, updated from the remote. Never touch the user's checkout.
2. **Conflicts; behind base when the host requires an up-to-date branch and nothing else blocks the merge; or base changed the package version since the PR branched**: merge the base branch into the PR's head branch, keep the intent of both sides, run the affected tests, push. The base is the PR's own base branch: on a stacked PR, its parent's branch, never `main`. On a stack the host restacks (e.g. Delta) too: merge `origin/<parent>` into the PR's own branch, resolve the conflicts, run the affected tests, then plain `git push`; never restack or force-push. If base changed the package version (e.g. `package.json` `version`), re-apply the PR's bump on top of base's with the repo's version command.
3. **CI**: read the failing logs, fix the root cause, push. A flaky or infra failure unrelated to the PR's change: re-trigger CI (rerun the job, or the repo's CI command), up to 3 times, one interval apart; still failing, treat it like any other failure. A failure only a parent PR's merge can clear: leave it and wait for that merge.
4. **Review comments** (inline, review bodies, top-level, bots) whose latest reply isn't yours:
   Read each comment before you reply to it.
   - A true improvement, nit and cosmetic included: fix it, push, reply with the commit SHA, then resolve the thread. Cite only a SHA you checked contains the fix; never resolve a thread you haven't verified. Agreeing isn't an answer: when you can't make the fix, leave the thread open and report the blocker.
   - Wrong or worse: check the source first, then reply with a short, polite reason. Resolve the thread when the reviewer is a bot; leave it for a person.
   - Unsure: follow the `decide` skill, act on your recommendation, and say what you chose in the reply.

   Once you've addressed a review, re-request it from that reviewer.
5. **Ready**:
   - Still a draft once its work is done (CI passed, no conflicts, every thread answered, nothing else still pushing to the branch, such as a tribunal run): mark it ready with `ready`; otherwise leave it a draft.
   - Not a draft, not approved by a human (as the host counts it): tell the user once whom to ask (the human reviewers already on the PR, else pick them as the `request-reviewers` skill does) and keep checking.
   - Not a draft, approved by a human, green, no conflicts, every thread answered: merge with `merge`, never with `--admin` or another bypass of the host's rules; without `merge`, tell the user once that it's ready to merge, and keep checking.

## Guardrails

- Act on your own recommendation. Never ask the user unless the step is wild (destructive, irreversible, or a real product call): then once, in one line with your recommendation, and carry on with the rest.
- Read live state before reporting a status (merged, green, resolved).
- Push only to the PR's branch (so no `dt submit --stack`), only changes in its scope, with plain `git push`. Never force-push.
- Others (e.g. another agent) may push to the branch too: integrate their pushes with `git pull --no-rebase` (or rebase only your own unpushed commits), then push. Never overwrite or drop their commits.
- A fix that still fails three checks later: try a different one. Report a blocker once, only when it's outside your control and you've tried everything, saying what you tried, then keep checking. Never approve, label or comment your way past a gate that waits on a person (a fork's workflow run, `/ok-to-test`, a deployment approval): treat it like a missing human review. Waiting on CI or reviewers isn't a blocker.
