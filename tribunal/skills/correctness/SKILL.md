---
name: correctness
description: "Make the code do what its callers expect on every input. Apply when writing or reviewing any change in behavior or signature."
---

# Correctness

The code does what its caller expects on every input, not only the one it was written for.

- Walk each changed path with the empty, boundary and failing case in hand, and follow every changed signature or behavior out to its callers.
- Flag what breaks: a value null where it is used, an async call not awaited, a condition that reads inverted, an error the caller handles but never receives, a caller the change forgot.
- Wrong behavior is a blocker; name the input that triggers it.
