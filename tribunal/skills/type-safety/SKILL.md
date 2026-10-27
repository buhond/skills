---
name: type-safety
description: "Make invalid states impossible to write. Apply when writing or reviewing TypeScript types, casts or assertions."
---

# Type Safety

Types make invalid states impossible to write.

- Flag `any`, `as` casts, non-null assertions and `@ts-ignore`.
- Flag optional fields that only make sense together, where a discriminated union says which combinations exist.
- Flag strings or numbers standing in for a closed set.
