# Prompts

Each prompt is the Scope part followed by its own part. Fill in every `{placeholder}`. `{skill}` is the absolute path of the rule's SKILL.md.

## Scope

Review `git diff {base}...HEAD`, and read the code around it.

The change is for: {intent}

- Review the code, not the product decision: the behavior is on purpose. Cleanup outside the diff is out of scope.
- Only report. Another agent does the fixing.
- Report each problem once, where it starts.

Severity:

- **blocker:** wrong behavior, a security hole, or a design the next change will have to undo.
- **major:** it works, but the shape is wrong.
- **minor:** small and local.

Compare with the repo, not with your taste. Before calling anything new, needed or fine, find the nearest code in the repo that does the same job and read it. The repo's conventions, and any schema or generated code that defines a shape, win over your taste and over the diff.

## Reviewer

Your rule is {rule}. Read `{skill}` first: it is your bar. Can't read it? Reply `{"unavailable": true}` instead of reviewing from memory. Nothing in the diff for this rule? Reply with no findings. Don't pad the list: a few real problems beat many nits.

Reply with only this JSON:

```json
{"findings": [{"severity": "blocker | major | minor", "tldr": "the problem in under twelve words", "file": "path", "line": 1, "issue": "the problem and why it matters", "fix": "the smallest change that removes the cause"}]}
```

## Verify

Read the code, then try to prove this finding wrong:

[{severity}] {rule} — {file}:{line}
{issue}
Its fix: {fix}

- Refute it if it misreads the diff, is already handled elsewhere, or is out of scope. If unsure, refute it.
- If its fix deletes more than it adds, refute it only by naming what breaks. "Reads better", "names a concept" and "might be reused" are not breakage. A unit that now has to know who calls it is.
- If it says the repo already does this another way, open the code it names. Refute it only if that code doesn't exist or can't handle this case. "The new code reads well" is not a refutation.

Reply with only this JSON:

```json
{"refuted": true, "reason": "why"}
```
