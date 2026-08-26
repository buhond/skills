---
name: code-review
description: 'Run a workflow that reviews a diff with one agent per rule — kiss, folder structure, bad patterns, architecture, tests, readability — then verifies each blocking finding. Use when asked to review code, a diff, or a PR, for feedback on code quality or design, or for a quality gate before merge.'
---

# Code Review

Reviewers — one subagent per rule, spawned by the workflow — judge the code. You apply the fixes.

## Workflow

1. Run `Workflow({ scriptPath: "<this skill's directory>/review.js", args: { base } })`, where `base` is the branch to diff against, default `origin/main`. If the Workflow tool is unavailable, say so and stop — never self-review in its place.
2. Surface the findings verbatim before acting on any of them.
3. Act on them whatever the verdict — `pass` means nothing blocks merge, not that nothing is left to fix. Rerun only on `fail`.
4. Stop and put the choice to the user after two failed cycles, or as soon as a run reverses a finding you applied or re-raises one you declined for a reason that still holds. Those runs are sampling taste, not finding defects.

## Result

`{ verdict, unreviewedRules, findings, dropped }`

- `verdict` — report as returned; never talk a finding down to reach `pass`.
- `unreviewedRules` — their agent died or could not read its skill file. Rerun them before trusting the result.
- `findings` — one per root cause, worst first, tagged with its `rule`; duplicates raised by other rules sit under `corroboratedBy`. `unverified` means its verify agent died.
- `dropped` — blocking findings the verify pass refuted, with its `reason`. Read them.

`review.js` owns the scope, rubric, weights, verify policy and fail condition. Don't restate them here.
