---
name: no-comments
description: "Replace comments with code that explains itself. Apply when writing or reviewing code that has comments, commented-out code or lint suppressions."
---

# No Comments

A comment that explains what the code does means the code didn't say it. Fix the code: a better name, a smaller function, a type or a test. Never a better comment.

A comment needs a reason the code can't give. Keep only:

- license headers;
- a reason the code can't show, like a bug in a dependency, a platform quirk or a constraint from outside the repo;
- doc comments on a public API: what other packages import, like a published library's exports. An app, plugin or service has almost none, and an `export` used only inside its own package is not public;
- links to an issue or a spec.

Delete everything else, doc comments included: comments that repeat the code or its name, docstrings on internal functions, types and fields, section banners, commented-out code, notes defending a workaround (fix the workaround instead). Not sure? Delete it. Deleting one is never a matter of taste.

A repo that comments everything sets no convention to follow: flag the comments in the diff all the same. Report each file's unneeded comments as one finding, at the first one, listing their lines.

Lint and type suppressions count too: `eslint-disable`, `@ts-ignore`, `# noqa`, `# type: ignore`, `rubocop:disable`, `//nolint`. Keep one only for a style-only rule. If it hides a real bug, fix the bug.
