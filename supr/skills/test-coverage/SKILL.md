---
name: test-coverage
description: "Test changed behavior, not implementation. Apply when writing or reviewing a change in behavior and its tests."
---

# Test Coverage

Every changed behavior has a test that fails without it.

- Changed behavior with no test is a blocker.
- Flag tests asserting implementation instead of behavior.
- Flag tests that pass whether or not the guard they name is there.
