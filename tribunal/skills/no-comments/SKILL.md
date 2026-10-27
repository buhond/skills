---
name: no-comments
description: "Replace comments with self-describing code. Apply when writing or reviewing code that has comments, commented-out code or lint suppressions."
---

# No Comments

A comment narrating what the code does marks code that failed to say it. The fix is a name, an extracted function, a type or a test — never a better sentence.

Only these survive:

- legal or license headers;
- behavior forced by a dependency, platform, vendor or protocol we cannot change;
- doc comments defining a public API contract;
- issue or RFC links explaining a constraint the code cannot express.

Everything else goes, including commented-out code and comments justifying a workaround: fix the workaround. Unsure whether one survives? It goes.

Lint and type suppressions (`eslint-disable`, `@ts-ignore`, `# noqa`, `# type: ignore`, `rubocop:disable`, `//nolint`) count too. One survives only when its rule is style-only; one hiding a real bug is fixed at the cause.
