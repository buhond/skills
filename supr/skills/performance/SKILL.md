---
name: performance
description: "Keep work proportional to what the caller needs. Apply when writing or reviewing queries, requests, loops, lists or rendering."
---

# Performance

Work grows with what the caller needs, not with the data.

- Flag queries or requests inside loops.
- Flag lists and queries with no limit or pagination.
- Flag work redone on every render or request that could run once.
- Flag re-renders caused by unstable props or context.
- Flag whole payloads fetched to read one field.
