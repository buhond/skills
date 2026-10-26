---
name: pr-babysit
description: 'Watch an open pull request on a schedule and keep it moving until it merges: fix failing CI, address and reply to review comments, resolve merge conflicts, and request the right reviewers. Use right after opening a PR, or when asked to babysit, watch, shepherd, or "get this PR merged".'
argument-hint: '[PR number or URL, default: current branch] [interval, default 10m]'
---

# PR Babysit

Once a PR is open, own it until it merges. Each check finds what blocks merge and fixes it; between checks, wait.

## Pick the tooling

Before the first check, find how this repo handles PRs, and use that for everything below — not `gh` by habit.

- Look for a repo- or company-specific tool first: repo docs (`README`, `CONTRIBUTING`, `AGENTS.md`), skills, `dev.yml`/scripts, and CLIs on `PATH` (for example Delta at Shopify, or Graphite `gt` for stacked PRs). Read its `--help` instead of guessing commands.
- Then MCP servers or a tool gateway that expose the code host, CI, or code ownership.
- Fall back to the host's own CLI or API (`gh` for GitHub, `glab` for GitLab).
- When that tool owns pushing, syncing, or merging (stacks, merge queues), go through it rather than raw `git push` or the host's merge button, so its state stays consistent.

The `gh` commands below show what each step needs; swap in the matching command from the tool you picked.

## Schedule

- Run one check right away, then repeat every interval (default 10 minutes).
- Use the harness's scheduler when it has one (`/loop`, a wake-up or cron tool, a background job). Otherwise loop in-session: `sleep <interval>` between checks, or the tool's own watch command while CI runs (`gh pr checks <pr> --watch`).
- Stop when the PR is merged or closed, or the user says stop. Say one line when you stop.

## Each check

1. Read the state: open or merged, draft, mergeable, check results, review decision, requested reviewers, head and base branch.
   - e.g. `gh pr view <pr> --json state,isDraft,mergeable,mergeStateStatus,reviewDecision,reviewRequests,headRefName,baseRefName,statusCheckRollup`
   - Work on the PR's head branch, synced fast-forward only. If unrelated local changes are in the way, use a separate worktree; never stash or discard the user's work.
2. Fix merge conflicts.
   - Bring the base branch in the way the repo does: the tool's sync/restack command, else merge `origin/<base>`. Rewrite history only when the repo clearly does, and then push with `--force-with-lease`, never plain `--force`.
   - Resolve each conflict by keeping the intent of both sides; run the affected tests before pushing.
3. Fix failing CI.
   - List failing checks and read their logs (e.g. `gh pr checks <pr>`, `gh run view <run-id> --log-failed`). CI may live outside the code host (Buildkite, CircleCI); follow the check's link to its logs.
   - Reproduce locally when possible, fix the root cause, commit, push.
   - Failure unrelated to the diff and looks flaky (timeout, network, runner): retry it once (e.g. `gh run rerun <run-id> --failed`). Fails again the same way: tell the user, don't keep retrying.
   - Never skip, disable, or loosen a test or check to turn it green.
4. Address review feedback.
   - Collect unresolved inline threads, review bodies, and top-level comments, including bots. Skip anything whose last reply is already yours.
   - For each one, decide:
     - It makes sense: fix it, then reply with what changed and the commit SHA.
     - It doesn't: don't change the code; reply with a short, polite reason.
     - It's a question: answer it.
     - It conflicts with the user's stated intent or needs a product call: leave it, and ask the user in one line with what you recommend.
   - Reply in the thread itself, not in a new top-level comment (e.g. `gh api repos/{owner}/{repo}/pulls/<pr>/comments/<comment-id>/replies -f body=...`). Leave resolving a thread to its reviewer unless the repo resolves on fix.
   - Batch fixes from one check into as few commits as reads clearly, then push once.
5. Get reviewers.
   - Skip when the PR is a draft or already has enough requested or approving reviewers.
   - Find who owns the touched code: `CODEOWNERS` or the company's ownership tool first, then recent authors of the changed files (`git log --format='%an <%ae>' -- <files>`, `git blame`).
   - Request one or two people, or the owning team (e.g. `gh pr edit <pr> --add-reviewer <login>`). Never the PR author or yourself; don't re-request someone who already reviewed this revision.
6. Ready to merge (approved, checks green, no conflicts, no open threads).
   - Merge, enable auto-merge, or add it to the merge queue only if the user asked for it; otherwise tell the user once that it's ready, and keep checking until it merges.
   - Nothing to do and still waiting on people: stay quiet; don't ping reviewers on every check.

## Guardrails

- Only push to the PR's own branch; never to the base branch.
- Keep fixes inside the PR's scope; note unrelated problems for the user instead of fixing them here.
- Same blocker survives three checks in a row despite your fixes: stop retrying it and tell the user what you tried.
- Only claim what you verified: say "fixed in <sha>" after the push, not before.
