---
name: clarity
description: "Make code read top to bottom, once. Apply when writing or reviewing names, conditions, nesting, function size or control flow."
---

# Clarity

Code should read top to bottom, once. Every time you scroll back, or open another file, to learn what a value holds, that is a finding.

Flag:

- **Names that don't say what the thing is.** Booleans read as yes/no questions: `isReady`, `hasAccess`.
- **Deep nesting.** Return early and keep the main path flat.
- **Mixed levels:** high-level steps next to low-level details. Move the details into a named function.
- **Functions too long to hold in your head.**
- **Flow you have to run in your head:** a flag set in one place and read far away, a loop with several exits, a clever one-liner.
- **Negative conditions that could read positively.**
- **Magic numbers and strings.** Name them.
- **Hidden changes:** shared mutable state, functions that change their inputs.
- **Inconsistency:** the same thing named or done two ways in one change.
