---
name: kiss
description: Apply KISS — produce simple, readable output (code, docs, configs, anything) with the minimum needed.
---

# KISS

Produce the minimum needed for the task — code, documentation, configuration, plans, or prose. The result should be easy for a human to read at a glance.

- If you're unsure whether to add something — a helper, an abstraction, an extra parameter, an extra section — don't add it.
- If something can be removed without breaking behavior or losing meaning, remove it.
- Trade many weak lines for one good one. Adding a line is worth it when it deletes several — never the reverse.
- Only factor something out (a function, a variable, a shared doc section) when it already repeats, never to prepare for future reuse.
- Don't be clever. A simple, obvious solution is always better than a smart one.
- Prefer positive conditions over negative ones. Inverted logic is harder to read — avoid it.
  ```jsx
  // harder
  if (!foo) return <Default />
  return <FooComponent />

  // clearer
  if (foo) return <FooComponent />
  return <Default />
  ```

## Reviewing code

Start with the whole: does this behavior need this many files and moving parts? Then in each unit, find every line, branch, parameter and layer that could go with behavior unchanged. If nothing breaks when it goes, it is a finding — a wrapper whose single caller is its only reason to exist is such a layer, and inlining it is the fix.

Generality that keeps a unit free of its callers is not that layer: narrowing it to today's one caller buys lines with coupling, and is the worse defect.
