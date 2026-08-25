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

Every P0/P1 finding then goes to a fresh agent that tries to refute it, and is dropped unless that second reader can confirm it — a reader who read the code and still hesitated is a refutation. A finding whose refute agent never answered is kept, not dropped, because that is no evidence rather than weak evidence. P2/P3 findings are reported unchecked, and the workflow logs how many.

## Verdict

`fail` when any P0 or P1 finding survives, or when a rule agent returns nothing — a dead reviewer is not a pass. Findings come back sorted by severity as `{ severity, file, line, issue, fix, rule, checked }`, where `checked` says whether a refute agent answered.

- `P0`: incorrect architecture or behavior with regression risk.
- `P1`: design flaw that should block merge.
- `P2`: meaningful maintainability or clarity issue.
- `P3`: minor issue that does not threaten the design.

Treat as P1 or worse: an abstraction added without present need, more code or state than the feature requires, duplicate logic left when consolidation is straightforward, a symptom-level patch over a live root cause, or changed behavior with no test.

## Scope

Review only the current diff and the code quality of the behavior it implements. Do not invent future requirements or demand unrelated cleanup. Treat behavior changes as intentional unless they create internal contradictions, unnecessary complexity, unclear ownership, or broken contracts inside the changed design. Prefer one root cause over several symptoms of the same flaw.

## Fix plan

Minimal and tied directly to a finding. For architectural work, "minimal" means the smallest change that restores correct ownership and dependency direction — not the smallest diff.
