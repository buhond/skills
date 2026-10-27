---
name: no-comments
description: "Replace comments with code that explains itself. Apply when writing or reviewing code that has comments, commented-out code or lint suppressions."
---

# No Comments

A comment that explains what the code does means the code didn't say it. Fix the code: a better name, a smaller function, a type or a test. Never a better comment.

Keep only:

- license headers;
- a reason the code can't show, like a bug in a dependency or a platform quirk;
- doc comments on a public API;
- links to an issue or a spec.

Delete everything else: comments that repeat the code, section banners, commented-out code, notes defending a workaround (fix the workaround instead). Not sure? Delete it.

Lint and type suppressions count too: `eslint-disable`, `@ts-ignore`, `# noqa`, `# type: ignore`, `rubocop:disable`, `//nolint`. Keep one only for a style-only rule. If it hides a real bug, fix the bug.
