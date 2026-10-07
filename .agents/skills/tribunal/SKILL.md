---
name: tribunal
description: 'Run a workflow that reviews a diff with one agent per rule, verifies every blocking finding, then fixes the code. Use when asked to review code, a diff, or a PR, for feedback on code quality or design, or as a quality gate before merge.'
---

# Tribunal

One subagent per rule judges the diff. You fix the code. The user runs this to end up with clean code, not with a list.

## Workflow

1. Commit pending changes first: reviewers read `git diff <base>...HEAD`, so uncommitted work is invisible to them.
2. Read `review.js` from this skill's directory with the Read tool, since shell output truncates long files. Run `Workflow({ script: <its full contents>, args: { base, files } })` — `base` is the branch to diff against, default `origin/main`; `files` is the array of paths `git diff --name-only <base>...HEAD` lists. Never pass `scriptPath`: Workflow refuses paths outside the working directory. If the Workflow tool is unavailable, say so and stop; never self-review in its place.
3. Fix the findings, whatever the verdict: `pass` means nothing blocks merge, not that nothing is left to fix. Commit, then rerun, passing `rules`: those whose findings you applied, plus `unreviewedRules`.
4. Decide every finding yourself — you have the diff, the code and the reviewer's reasoning, which is everything the call needs. Never ask the user which to apply or whether to continue.
5. Reruns sample taste. A finding that reverses one you applied, or re-raises one you declined for a reason that still holds, is churn: keep your version. Stop when a rerun brings nothing but churn, or after three cycles, then report every finding as below.

Where a finding conflicts with the user's stated intent, or the code makes no sense under any intent you can infer, leave that one unfixed: finish the rest, then ask in a one-line note with what you recommend.

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
- `dropped` — findings the verify pass refuted, with its `reason`. Read them; they never reach the table.

`review.js` owns the rules, scope, severities, verify policy and fail condition. Don't restate them here.
