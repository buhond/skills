---
name: tribunal
description: "Review a diff with one subagent per rule, verify the findings, then fix the code until a run finds nothing left to fix. Use when asked to review code, a diff or a PR, for feedback on code quality or design, or as a quality gate before merge."
argument-hint: "[max cycles, default 3]"
---

# Tribunal

One subagent per rule reviews the diff. You fix the code. The goal is clean code, not a list of findings. It runs alone: never ask the user anything.

## Rules

Each rule is a sibling skill, `../<rule>/SKILL.md` from this file: kiss, no-slop, no-comments, clarity, single-responsibility, dry, prior-art, folder-structure, state-ownership, type-safety, error-handling, correctness, security, performance, test-coverage, design-system.

Every rule runs on every diff, except `design-system`, which needs UI code, and `type-safety`, which needs typed code.

- **High reasoning:** correctness, security, performance.
- **Verify majors:** kiss, no-slop, dry, single-responsibility, performance.

## Cycle

1. **Scope.** Commit pending changes: reviewers read `git diff <base>...HEAD` and can't see uncommitted work. `<base>` is the pull request's base branch from the repo's PR tool (e.g. `gh pr view --json baseRefName`, as `origin/<name>`), else the remote's default branch. Fetch it first.
2. **Intent.** Write one paragraph on what the change is for, from the PR description, the commit messages and the code.
3. **Review.** Start one read-only subagent per rule, all at once, each given the Scope and Reviewer parts of `references/prompts.md`. Give the high-reasoning rules the highest reasoning setting available. No subagent tool? Say so and stop. Never review the diff yourself instead. A reviewer that dies, replies without the JSON, or replies `unavailable` leaves its rule unreviewed.
4. **Verify.** For every blocker, and every major from a verify-majors rule, start a fresh subagent with the Scope and Verify parts. Drop the findings it refutes. One that dies leaves its finding unverified.
5. **Group.** Merge findings that one fix would solve together. Sharing a file or a topic is not enough. Keep the most severe as the main one.
6. **Decide** every finding yourself. Apply it unless:
   - its input can't happen: check the real callers before trusting a "what if";
   - it adds an abstraction nothing needs yet;
   - it is taste: a different way, with no real problem shown in this one;
   - it goes against the intent, or the code makes no sense under any intent you can guess. Leave it open, with what you recommend.
7. **Fix** the applied findings and commit. Never push: whoever started the run decides that.

Then run again from step 3. Each new run may suggest undoing your work: when a finding reverses a fix you made, or repeats one you declined for a reason that still holds, keep your version. Stop when a run reviews every rule and finds nothing to fix, or at the cycle cap: the skill's argument, default three.

## Verdict

**fail** if the last run left a blocker unfixed, a rule unreviewed or a finding unverified. Otherwise **pass**.

## Report

One sentence, one table, then the open findings. Nothing else.

> Verdict: **pass**. 5 applied, 2 declined, 1 open.
>
> | Finding | Rule | Fix |
> | --- | --- | --- |
> | **blocker** · fetch follows redirects off the allowlist | security | `redirect: 'error'` |
> | **major** · size cap checked after the body is buffered | performance | reject on `content-length` |
>
> Open: **major** · `retry` drops the payload the PR says to keep (correctness). Recommend keeping the payload.

One row per applied finding, most severe first, from its `tldr` and rule. After the table, name any unreviewed rules and unverified findings.
