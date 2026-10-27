---
name: type-safety
description: "Make invalid states impossible to write. Apply when writing or reviewing types, type hints, casts, assertions or type-checker suppressions, in any typed language."
---

# Type Safety

Types make invalid states impossible to write.

- Flag escape hatches from the type checker: `any` and `as` in TypeScript, `Any` and `cast` in Python, `interface{}` in Go, `unsafe` in Rust, non-null assertions, and suppressions like `@ts-ignore` or `# type: ignore`.
- Flag optional fields that only make sense together, where a union, sum type or sealed hierarchy says which combinations exist.
- Flag strings or numbers standing in for a closed set, where an enum or literal type fits.
