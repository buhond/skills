---
name: test-coverage
description: "Every changed behavior has a test that fails without it. Apply when writing or reviewing a change in behavior and its tests."
---

# Test Coverage

Every changed behavior has a test that fails without the change.

- **Changed behavior with no test is a blocker.**
- **Test what callers see:** return values, errors, what gets saved or sent. Not private helpers or call order.
- **The break test:** break the code on purpose. If the test still passes, it proves nothing.
- **The refactor test:** rewrite the insides without changing behavior. If the test fails, it is tied to the implementation.
- **Cover the edges:** empty, boundary, invalid input, the error path.
- **Mock only what you don't own:** the network, the clock, third parties. Mocking your own code tests the mock.
- **Keep tests deterministic:** no sleeps, no real time, no order between tests, no shared state.
