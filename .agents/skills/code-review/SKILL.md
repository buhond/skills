---
name: code-review
description: 'Run a workflow that reviews a diff with one agent per rule — kiss, folder structure, bad patterns, architecture, tests, readability — then verifies each blocking finding. Use when asked to review code, a diff, or a PR, for feedback on code quality or design, or for a quality gate before merge.'
---

# Code Review

Two roles: **reviewers** (one subagent per rule, spawned by the workflow) judge the code, and the **implementing agent** (you) applies fixes.

## Workflow

1. Run `review.js` from this skill's directory with the Workflow tool:
   `Workflow({ scriptPath: "<this skill's directory>/review.js", args: { base } })`
   - `base` — the branch to diff against, default `origin/main`.
   - If the Workflow tool is unavailable, say so and stop — do not silently self-review.
2. Surface the returned findings verbatim before acting on them — the user must see reviewer findings separately from fixer actions.
3. On `fail`, apply each finding's `fix` and rerun the workflow.
4. Stop and surface the unresolved choice instead of iterating blindly — after two failed cycles, or as soon as a run contradicts an earlier one: it reverses a finding you already applied, or re-raises one you declined for a reason that still holds. Contradictions mean the runs are sampling reviewer taste, not finding defects. Say so and stop.

## Result

`{ verdict, score, unreviewedRules, findings, dropped }`.

- `verdict` / `score` — report as returned; never trade a finding away to protect the number.
- `unreviewedRules` — rules whose agent died or could not read its skill file. Rerun them before trusting the result.
- `findings` — one entry per root cause, sorted by severity and tagged with the `rule` that raised it. Reviewers never see each other, so the same defect arrives several times; a clustering pass merges those into the most severe one, which then carries `rootCause` and the `corroboratedBy` list. Nothing is discarded — a merged entry stands for every finding it names, and scoring charges each cause once. A finding marked `unverified` had its verify agent die.
- `dropped` — blocking findings the verify pass refuted, with its `reason`. Read them: an uncertain refuter drops rather than keeps.

`review.js` owns the scope, the severity rubric, the weights, the verify policy, the fail condition and what a good fix looks like. Don't restate any of them here.
