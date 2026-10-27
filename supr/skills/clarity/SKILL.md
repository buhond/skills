---
name: clarity
description: "Make code read top to bottom once. Apply when writing or reviewing names, conditions, control flow or error handling."
---

# Clarity

Read each unit top to bottom once. Every jump backwards, or out to another file, to learn what a value holds is a defect.

- Flag control flow you have to simulate.
- Flag conditions that could read positively.
- Flag names that hide what the thing is, and magic values.
- Flag swallowed errors and shared mutable state.
