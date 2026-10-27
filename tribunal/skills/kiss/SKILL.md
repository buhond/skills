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

- First the whole change: could it work with fewer files, layers or moving parts?
- Then each line, branch, parameter and layer: if removing it changes nothing, it is a finding.
- A wrapper with one caller and nothing of its own is such a layer. Inline it.
- Don't strip generality that keeps a unit unaware of who calls it. Tying it to its one caller saves lines but couples them, and that is worse.
