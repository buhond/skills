---
name: tribunal
description: 'Review a diff with one subagent per rule, verify the findings, then fix the code until a run leaves nothing to apply. Use when asked to review code, a diff, or a PR, for feedback on code quality or design, or as a quality gate before merge.'
argument-hint: '[max cycles, default 3]'
---

# Tribunal

One subagent per rule judges the diff. You fix the code. The user runs this to end up with clean code, not with a list. It runs unattended: never ask the user anything.

## Rules

Every sibling skill directory (`../*/SKILL.md` from this file) except this one is a rule. Every rule runs on every diff, except `design-system`, which needs UI code, and `type-safety`, which needs typed code.

- **High reasoning:** performance, correctness, security.
- **Verify majors:** kiss, dry, single-responsibility, performance.

## Cycle

1. **Scope.** Commit pending changes: reviewers read `git diff <base>...HEAD`, so uncommitted work is invisible to them. `<base>` is the pull request's base branch from the repo's PR tool (e.g. `gh pr view --json baseRefName`, as `origin/<name>`), else the remote's default branch.
2. **Intent.** Write one paragraph on what the change is for, from the pull request description, the commit messages and the code.
3. **Review.** Start one read-only subagent per rule, all at once, each with the Scope and Reviewer parts of `references/prompts.md` filled in. Give the high-reasoning rules the highest reasoning setting the tool offers. No subagent tool? Say so and stop; never review the diff yourself in their place. A reviewer that dies, replies without the JSON, or replies `unavailable` leaves its rule unreviewed.
4. **Verify.** For every blocker, and every major from a verify-majors rule, start a fresh subagent with the Scope and Verify parts filled in. Drop what it refutes. One that dies leaves its finding unverified.
5. **Group.** Merge the findings one fix resolves together: fixing one leaves the others nothing to report. Sharing a file or a theme is not enough. The worst stays primary.
6. **Decide** every finding yourself, whatever its severity. Apply it unless:
   - its input can't happen: trace the callers before trusting a "what if";
   - it extracts an abstraction no second use needs yet;
   - it is taste: a different approach with no concrete problem shown in this one;
   - it conflicts with the intent, or the code makes no sense under any intent you can infer. Leave it open, with what you recommend.
7. **Fix** the applied findings and commit. Never push: whoever started the run decides that.

Then rerun from step 3. Reruns sample taste: a finding that reverses one you applied, or re-raises one you declined for a reason that still holds, is churn: keep your version. Stop once a run reviews every rule and leaves nothing to apply, or at the cycle cap (`/tribunal 10`, default three).

## Verdict

**fail** when the last run left a blocker unapplied, a rule unreviewed or a finding unverified; otherwise **pass**.

## Report

One sentence, then one table, then the open findings, nothing else.

> Verdict: **pass**. 5 applied, 2 declined, 1 open.
>
> | Finding | Rule | Fix |
> | --- | --- | --- |
> | **blocker** · fetch follows redirects off the allowlist | security | `redirect: 'error'` |
> | **major** · size cap checked after the body is buffered | performance | reject on `content-length` |
>
> Open: **major** · `retry` drops the payload the PR says to keep (correctness). Recommend keeping the payload.

One row per applied finding, worst first, from its `tldr` and rule. Name unreviewed rules and unverified findings after the table.
