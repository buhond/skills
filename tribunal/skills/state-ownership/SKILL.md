---
name: state-ownership
description: "Give every piece of state one owner and one source. Apply when writing or reviewing state, caches, stores, copied fields or code that keeps two values in step."
---

# State Ownership

Every piece of state has one owner and one source of truth.

- **Flag copies kept in step by hand:** an input copied into local state, code that syncs one value from another, the same data stored in two places.
- **Flag stored values that could be computed when read.** Compute them.
- **Flag side effects that react to a change** when the work belongs in the action that caused it.
- **Flag global or module-level mutable state.** Pass it in, or give it one owner.

The fix computes the value, moves the state to the nearest shared owner, or moves the work into the action. In React: props copied into state, `useEffect` syncing values, effects doing an event handler's job.
