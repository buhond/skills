---
name: error-handling
description: "Check data once where it enters, trust it inside, and fail loudly where something can be done. Apply when writing or reviewing validation, try/catch, error returns, retries or cleanup."
---

# Error Handling

Check data once, where it enters. Inside, trust it. When something fails, let it fail loudly, up to the place that can do something about it.

- **Validate at the edge:** request bodies, CLI arguments, environment variables, files, API responses. Turn raw input into typed values there, once. Flag the same check repeated deeper in.
- **Flag swallowed errors:** an empty catch, catch-and-log, returning null or a default on failure. The caller can no longer tell failure from success.
- **Catch only what you can handle.** Let the rest reach the one place that reports it.
- **Flag catch-alls that treat a bug like an expected failure**, such as a typo handled the same as a network timeout.
- **Error messages say what failed and with which value**, so someone can fix it without a debugger. Never put secrets in them.
- **Retry only what is safe to repeat**, with a limit and a backoff. Flag retries around writes that would run twice.
- **Clean up on every path:** close files, connections, locks, timers and subscriptions, even when an error is thrown.
