---
name: correctness
description: "Make the code do what its callers expect on every input. Apply when writing or reviewing any change in behavior or signature."
---

# Correctness

The code does what its callers expect for every input, not just the one it was written for.

Walk each changed path with these inputs: empty, one, many, the boundary, missing, invalid, and the failure case. Then follow every changed function out to its callers.

Flag what breaks:

- a value that can be null where it is used;
- an async call not awaited;
- an off-by-one, an inverted condition, a comparison between the wrong types;
- two requests or jobs racing on the same data: check-then-write, or read-modify-write with no lock or transaction;
- a write that happens twice on a retry or a double click;
- a partial failure: step two fails and step one's change stays;
- money in floats, dates without a time zone;
- a caller the change forgot.

Wrong behavior is a blocker. Name the input that triggers it.
