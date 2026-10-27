---
name: type-safety
description: "Use types so wrong states can't be written. Apply when writing or reviewing types, type hints, casts, assertions or type-checker suppressions, in any typed language."
---

# Type Safety

Use types so wrong states can't be written at all.

- **Flag escape hatches:** `any` and `as` in TypeScript, `Any` and `cast` in Python, `interface{}` in Go, `unsafe` in Rust, non-null assertions, and suppressions like `@ts-ignore` or `# type: ignore`.
- **Flag fields that must stay in step**, like `isLoading`, `error` and `data`. Use one union or enum that lists the valid states.
- **Flag plain strings or numbers standing for a fixed set.** Use an enum or literal type.
- **Flag values that share a type but mean different things**, like a user ID and an order ID, or seconds and milliseconds. Give them distinct types where the language allows.
- **Flag a `switch` or `match` over a union with no check that every case is handled.**
