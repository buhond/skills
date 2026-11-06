---
name: tribunal
description: "Review a diff with one subagent per rule, verify the findings, then fix the code until a run finds no blocker or major left to fix. Use when asked to review code, a diff or a PR, for feedback on code quality or design, or as a quality gate before merge."
argument-hint: "[max cycles, default 3]"
---

# Tribunal

One subagent per rule reviews the diff. You fix the code unless Ownership says review only. The goal is clean code, not a list of findings. It runs alone: never ask the user anything.

## Rules

Each rule is a sibling skill, `../<rule>/SKILL.md` from this file: kiss, no-slop, no-comments, clarity, single-responsibility, dry, prior-art, folder-structure, state-ownership, type-safety, error-handling, correctness, security, performance, test-coverage, design-system.

Every rule runs on every diff, except `design-system`, which needs UI code, and `type-safety`, which needs typed code.

- **Strong tier:** correctness, security, performance. Use your strongest subagent you can pick, at the highest reasoning setting available (in omp, `task` at high reasoning), never a fast or cheap one.
- **Fast tier:** every other rule. Use a fast, cheap, read-only subagent (in omp, `scout`), else the default one.
- **Verify majors:** kiss, no-slop, dry, single-responsibility, performance.
- **No subagent tool?** Run reviewers and verifiers with anything else that starts separate sessions, such as a dynamic workflow; if those sessions can't see your checkout, put the diff in each prompt. Make every fix yourself. If nothing like that exists, do each subagent's job yourself, one at a time, each from its own prompt in `references/prompts.md`.

## Ownership

Find the open pull request: by branch when the branch has an upstream (e.g. `gh pr view --json number,state,author,assignees,headRefOid`; one that isn't open counts as none found), else by commit, the open one whose head is `HEAD` (e.g. `gh pr list --state open --search <sha>`), since a checked-out PR often has another local name. Use its number in every later PR tool call. You own it when you are its author or an assignee (against your login in the repo's PR tool, e.g. `gh api user --jq .login`), or the user said in the conversation to change it anyway. No pull request found, or you own it: run the Cycle as below. A lookup that fails means not yours, except a PR lookup on a branch with no upstream, which counts as none found; name every failed lookup in your report.

Not yours? Review only: run the Cycle once without Decide and Fix, committing nothing (not even Scope's commit). Reviewers and verifiers read files, so run them in a separate worktree at the pull request's head commit (`HEAD` if the lookup failed), fetched first, never in the checkout. Then post one PR comment: the commit you reviewed, one table row per finding left after Group, most severe first, with its severity, tldr, rule, file, line and suggested fix, then any unreviewed rules and unverified findings, with no secret or real personal data. A security hole the base or default branch has too stays out of the comment; put it only in your report. Write the comment to a file outside the checkout and post it to that PR with the repo's PR tool (e.g. `gh pr comment <PR> --body-file`). Can't post it? Put the comment in your report instead. Report the verdict and the comment's URL in place of the Report's counts and table.

## Cycle

1. **Scope.** Commit pending changes: reviewers read `git diff <base>...HEAD` and can't see uncommitted work. `<base>` is the pull request's base branch from the repo's PR tool (e.g. `gh pr view --json baseRefName`, as `origin/<name>`), else the remote's default branch. Fetch it first.
2. **Intent.** Write one paragraph on what the change is for, from the PR description, the commit messages and the code.
3. **Review.** Start one subagent per rule, all at once, on its tier, each given the Scope and Reviewer parts of `references/prompts.md`. A reviewer that dies, replies without the JSON, or replies `unavailable`: start it again; only one that fails again leaves its rule unreviewed.
4. **Verify.** For every blocker, and every major from a verify-majors rule, start a fresh strong-tier subagent with the Scope and Verify parts as soon as that reviewer replies; don't wait for the others. Never verify on the fast tier, whatever the rule's tier. Drop the findings it refutes. One that dies: start it again; only one that dies again leaves its finding unverified.
5. **Group.** Merge findings that one fix would solve together. Sharing a file or a topic is not enough. Keep the most severe as the main one.
6. **Decide** every finding yourself. Apply it unless:
   - its input can't happen: check the real callers before trusting a "what if";
   - it adds an abstraction nothing needs yet;
   - it is taste: a different way, with no real problem shown in this one. Other code doing the same is no reason to decline when the finding's rule says the repo's habit doesn't count;
   - it goes against the intent, or the code makes no sense under any intent you can guess. Leave it open, with what you recommend.
7. **Fix** the applied findings. Give each group of findings whose files no other group touches its own subagent, all at once; fix the rest yourself. Then run the repo's tests and type check once, fix what broke, and commit. Never push: whoever started the run decides that.

Then run again from step 3 on the whole `<base>...HEAD`, not just the fix, so a later run catches what an earlier one missed. Give its subagents every finding declined or left open so far as `{declined}`. Each new run may suggest undoing your work: when a finding reverses a fix you made, or repeats one you declined for a reason that still holds, keep your version. Stop when a run reviews every rule and finds no blocker or major to apply: fix its minors and stop without another run. Otherwise stop at the cycle cap: the skill's argument, default three.

## Verdict

**fail** if the last run left a blocker unfixed, a rule unreviewed or a finding unverified. Otherwise **pass**.

## Report

One sentence, one table, then the open findings and what Ownership adds. Nothing else.

> Verdict: **pass**. 5 applied, 2 declined, 1 open.
>
> | Finding | Rule | Fix |
> | --- | --- | --- |
> | **blocker** · fetch follows redirects off the allowlist | security | `redirect: 'error'` |
> | **major** · size cap checked after the body is buffered | performance | reject on `content-length` |
>
> Open: **major** · `retry` drops the payload the PR says to keep (correctness). Recommend keeping the payload.

One row per applied finding, most severe first, from its `tldr` and rule. After the table, name any unreviewed rules and unverified findings.
