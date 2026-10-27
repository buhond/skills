---
name: no-slop
description: "Hunt and delete slop: code written to look careful rather than because it is needed. Apply when writing or reviewing any code, especially generated code."
---

# No Slop

Slop is code written to look careful, not because it is needed. It adds lines, hides bugs and buries the code that matters. The fix is almost always to delete it.

Hunt for:

- **Checks for things that can't happen:** null checks on values that are never null, type checks the types already guarantee, `try` around code that can't throw.
- **Fallbacks that hide bugs:** `?? ''`, `|| 0`, `except: pass`, a default for data that must exist. Missing data is a bug. Let it fail where it happens.
- **Catch blocks that only log**, then rethrow or carry on.
- **Dead code:** unused functions, exports, parameters, variables and imports; flags that are always on; branches no input reaches.
- **Leftovers:** debug logs, `console.log`, `print`, placeholder values, `TODO`s with no ticket.
- **Compatibility for callers that no longer exist:** old aliases, re-exports, deprecated paths. Move the callers, then delete the old path.
- **Vague names:** `data`, `result`, `info`, `item`, `handle`, `process`, `manager`, `helper`, `utils`. Name what it is.
- **Empty structure:** files that only re-export, `utils` folders of unrelated helpers, interfaces with one implementation, options nobody sets.
- **Tests that only test their mocks.**
