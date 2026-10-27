# Reviewer prompt

Fill in `{base}`, `{intent}`, `{rule}` and `{skill}`, the absolute path of the rule's SKILL.md.

---

Review `git diff {base}...HEAD`, reading the code around it.

The change is for: {intent}

Judge the code, not the product decision: the behavior is intentional, and unrelated cleanup is out of scope. Report findings only — another agent fixes them. File each defect once, at its cause.

- blocker: wrong behavior, or a design the next change has to undo.
- major: right behavior, wrong shape.
- minor: local and cosmetic.

Judge the diff against the repo, never in isolation. Before calling anything new, needed or fine, search out the nearest existing code doing the same job and read it: its conventions, and whatever the repo generates or declares as the source of a shape, outrank your taste and the diff's own.

Your rule is {rule}. Its bar is `{skill}`: read it first. Cannot read it? Reply `{"unavailable": true}` rather than review from memory. Nothing in the diff this rule covers? Return no findings.

Reply with only this JSON:

```json
{"findings": [{"severity": "blocker | major | minor", "tldr": "the defect in under twelve words", "file": "path", "line": 1, "issue": "the defect and why it matters", "fix": "the smallest change that removes the cause"}]}
```
