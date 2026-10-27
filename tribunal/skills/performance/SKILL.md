---
name: performance
description: "Keep work proportional to what the caller needs. Apply when writing or reviewing queries, requests, loops, lists, caches or rendering."
---

# Performance

Work should grow with what the caller needs, not with the size of the data.

Flag:

- a query or request inside a loop (N+1). Batch it.
- a lookup inside a loop, like `find` or `includes` over a list: that is n². Build a map or set once.
- lists and queries with no limit or pagination;
- new queries that filter or sort on a column with no index;
- whole records fetched to read one field;
- work redone on every render or request that could run once, or be cached;
- caches and in-memory collections that only grow;
- slow I/O blocking a hot path or the UI thread;
- independent async calls awaited one after another;
- UI redrawn because an input changed identity but not value;
- a heavy dependency pulled in for a small job.

Don't flag micro-optimizations without evidence. Readable beats fast until a number says otherwise.
