---
name: state-ownership
description: "Give every piece of UI state one owner and one source. Apply when writing or reviewing React state, props, effects or context."
---

# State Ownership

Every piece of state has one owner and one source.

- Flag props copied into state, effects that keep one value in step with another, stored values render could compute, the same state held in two places, and effects doing what belongs in the event handler that caused it.
- The fix derives the value, lifts the state to the nearest common owner, or moves the work into the handler.
