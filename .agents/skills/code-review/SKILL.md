---
name: code-review
description: 'Run a workflow that reviews a diff with one agent per rule — kiss, folder structure, bad patterns, architecture, tests, readability — then verifies each blocking finding. Use when asked to review code, a diff, or a PR, for feedback on code quality or design, or for a quality gate before merge.'
---

# Code Review

Two roles: **reviewers** (one subagent per rule, spawned by the workflow) judge the code, and the **implementing agent** (you) applies fixes. Reviewers only report — never let a reviewer edit code.

## Workflow

1. Run `review.js` from this skill's directory with the Workflow tool:
   `Workflow({ scriptPath: "<this skill's directory>/review.js", args: { base } })`
   - `base` — the branch to diff against, default `origin/main`.
   - If the Workflow tool is unavailable, say so and stop — do not silently self-review.
2. Surface the returned findings verbatim before acting on them — the user must see reviewer findings separately from fixer actions.
3. On `fail`, apply each finding's `fix` and rerun the workflow.
4. After two failed cycles, stop and surface the unresolved choice clearly instead of iterating blindly.

Every P0/P1 finding then goes to a fresh agent that tries to refute it. It is dropped only when that second reader explicitly refutes it, and kept — unverified — when the reader answers nothing or dies. P2/P3 findings never go through this pass.

## Verdict

`fail` when a blocking finding survives or a rule agent dies — a dead reviewer is not a pass. Findings come back sorted by severity as `{ severity, file, line, issue, fix, rule }`, plus `verified` on the blocking ones saying whether a refute agent answered.

`score` summarises the surviving findings out of 100, and is `null` when a rule died. Report it with the verdict; never trade a finding away to protect the number.

`review.js` owns the scope, the severity rubric, the weights and the fail condition. Don't restate any of them here.

## Fix plan

Minimal and tied directly to a finding. For architectural work, "minimal" means the smallest change that restores correct ownership and dependency direction — not the smallest diff.
