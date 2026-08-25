---
name: code-review
description: 'Run a workflow that reviews a diff with one agent per rule — kiss, folder structure, bad patterns, architecture, tests, readability — then verifies each blocking finding. Use when asked to review code, a diff, or a PR, for feedback on code quality or design, or for a quality gate before merge.'
---

# Code Review

Two roles: **reviewers** (one subagent per rule, spawned by the workflow) judge the code, and the **implementing agent** (you) applies fixes. Reviewers only report — never let a reviewer edit code.

## Workflow

1. Run `review.js` from this skill's directory with the Workflow tool:
   `Workflow({ scriptPath: "<this skill's directory>/review.js", args: { base, skills } })`
   - `base` — the branch to diff against, default `origin/main`.
   - `skills` — path to the skills directory, so the rule agents can read `kiss/SKILL.md` and `folder-structure/SKILL.md`. Default `.agents/skills`.
   - If the Workflow tool is unavailable, say so and stop — do not silently self-review.
2. Surface the returned findings verbatim before acting on them — the user must see reviewer findings separately from fixer actions.
3. On `fail`, apply each finding's `fix` and rerun the workflow.
4. After two failed cycles, stop and surface the unresolved choice clearly instead of iterating blindly.

Every P0/P1 finding then goes to a fresh agent that tries to refute it, and survives only if that second reader confirms it. P2/P3 findings are reported unchecked, and the workflow logs how many.

## Verdict

`fail` when any P0 or P1 finding survives, or when a rule agent returns nothing — a dead reviewer is not a pass. Findings come back sorted by severity as `{ severity, file, line, issue, fix, rule, checked }`, where `checked` says whether a refute agent answered.

`score` is 100 minus 25 per surviving P0, 15 per P1, 5 per P2 and 2 per P3, floored at 0 — a summary, not a second gate, and `null` when a rule died. Report it with the verdict; never trade a finding away to protect the number.

`review.js` owns the scope and the severity rubric, so the reviewers actually see them. Don't restate either here.

## Fix plan

Minimal and tied directly to a finding. For architectural work, "minimal" means the smallest change that restores correct ownership and dependency direction — not the smallest diff.
