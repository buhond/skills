# Prompts

Each prompt is the scope followed by its own part. Fill in every `{placeholder}`; `{skill}` is the absolute path of the rule's SKILL.md.

## Scope

Review `git diff {base}...HEAD`, reading the code around it.

The change is for: {intent}

Judge the code, not the product decision: the behavior is intentional, and unrelated cleanup is out of scope. Report findings only — another agent fixes them. File each defect once, at its cause.

- blocker: wrong behavior, or a design the next change has to undo.
- major: right behavior, wrong shape.
- minor: local and cosmetic.

Judge the diff against the repo, never in isolation. Before calling anything new, needed or fine, search out the nearest existing code doing the same job and read it: its conventions, and whatever the repo generates or declares as the source of a shape, outrank your taste and the diff's own.

## Reviewer

Your rule is {rule}. Its bar is `{skill}`: read it first. Cannot read it? Reply `{"unavailable": true}` rather than review from memory. Nothing in the diff this rule covers? Return no findings.

Reply with only this JSON:

```json
{"findings": [{"severity": "blocker | major | minor", "tldr": "the defect in under twelve words", "file": "path", "line": 1, "issue": "the defect and why it matters", "fix": "the smallest change that removes the cause"}]}
```

## Verify

Read the code, then try to refute this finding:

[{severity}] {rule} — {file}:{line}
{issue}
Its fix: {fix}

Refute it if it misreads the diff, is already handled elsewhere, or is out of scope, and default to `refuted: true` when unsure. Where its fix deletes more than it adds, refute it only by naming what breaks — reading well, naming a concept and future reuse are not breakages, but a unit left knowing its callers is.

Where it says the diff diverges from how the repo already does this, go and read the code it names: refute it only if that precedent does not exist or cannot carry this case. That the new shape reads well is not a refutation.

Reply with only this JSON:

```json
{"refuted": true, "reason": "why"}
```
