---
name: code-review
description: 'Run a workflow that reviews a diff with one agent per rule — kiss, folder structure, solid, composition, dry, reinventing the wheel, spaghetti, tests — verifies every blocking finding, then fixes the code. Use when asked to review code, a diff, or a PR, for feedback on code quality or design, or as a quality gate before merge.'
---

# Code Review

One subagent per rule judges the diff. You fix the code. The user runs this to end up with clean code, not with a list.

## Workflow

1. Run `Workflow({ scriptPath: "<this skill's directory>/review.js", args: { base } })` — `base` is the branch to diff against, default `origin/main`. If the Workflow tool is unavailable, say so and stop; never self-review in its place.
2. Report the findings as below, then fix them. Act on them whatever the verdict: `pass` means nothing blocks merge, not that nothing is left to fix. Rerun only on `fail`.
3. Decide every finding yourself — you have the diff, the code and the reviewer's reasoning, which is everything the call needs. Never ask the user which to apply or whether to continue.
4. Reruns sample taste. A finding that reverses one you applied, or re-raises one you declined for a reason that still holds, is churn: keep your version. Stop after two `fail` cycles, or once only churn is left.

Raise something to the user only where a finding conflicts with their stated intent, as a one-line note beside the finished work.

## Report

One sentence, then one table, nothing else.

> Verdict: **pass**. 5 applied, 2 declined.
>
> | Finding | Verdict |
> | --- | --- |
> | **blocker** · fetch follows redirects off the allowlist | Applied — `redirect: 'error'` |
> | **major** · size cap checked after the body is buffered | Applied — reject on `content-length` |
> | **minor** · `routeImage` duplicates `image` | Declined — cycle 2 raised the opposite |

One row per finding, declined ones included, worst first, using its `tldr`. Corroborating duplicates never get their own row.

## Result

`{ verdict, unreviewedRules, findings, dropped }`

- `unreviewedRules` — their agent died or could not read its skill file. Rerun them before trusting the result.
- `findings` — one per root cause, worst first, tagged with its `rule`; duplicates sit under `corroboratedBy`. `unverified` means its verify agent died.
- `dropped` — blocking findings the verify pass refuted, with its `reason`. Read them; they never reach the table.

`review.js` owns the rules, scope, severities, verify policy and fail condition. Don't restate them here.
