---
name: state-ownership
description: "Give every piece of state one owner and one source. Apply when writing or reviewing state, caches, stores, copied fields or code that keeps two values in step."
---

# State Ownership

Every piece of state has one owner and one source.

- Flag inputs copied into local state, code that keeps one value in step with another, stored values that could be computed when read, the same state held in two places, and reactions doing what belongs in the action that caused them.
- The fix derives the value, moves the state to the nearest common owner, or moves the work into the action.
- In React, that means props copied into state, effects syncing values, and effects doing an event handler's job.
