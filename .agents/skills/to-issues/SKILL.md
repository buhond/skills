---
name: to-issues
description: Break a plan, spec, or PRD into independently-grabbable issues written to <FEATURE>_ISSUES.md, using tracer-bullet vertical slices.
disable-model-invocation: true
---

Break a plan into independently-grabbable issues using vertical slices (tracer bullets), and write them to `<FEATURE>_ISSUES.md`.

## Process

### 1. Gather context

Work from whatever is already in the conversation context. If the user passes a file path as an argument (e.g. `USER_SELECT_PRD.md`), read it. If nothing was provided, look for a `*_PRD.md` at the repository root that matches the feature being discussed — if it's ambiguous which one, ask.

### 2. Explore the codebase

If you have not already explored the codebase, do so to understand the current state of the code. Issue titles and descriptions should use the project's existing vocabulary and conventions.

Look for opportunities to prefactor the code to make the implementation easier. "Make the change easy, then make the easy change."

### 3. Draft vertical slices

Break the plan into **tracer bullet** issues. Each issue is a thin vertical slice that cuts through ALL integration layers end-to-end, NOT a horizontal slice of one layer.

- Each slice delivers a narrow but COMPLETE path through every layer (e.g. schema, API, UI, tests)
- A completed slice is demoable or verifiable on its own
- Any prefactoring should be its own slice, done first

### 4. Check the breakdown with the user

Present the proposed breakdown as a numbered list. For each slice, show its title, what it's blocked by (if anything), and which user stories it covers (if the source material has them).

Ask the user:

- Does the granularity feel right? (too coarse / too fine)
- Are the dependency relationships correct?
- Should any slices be merged or split further?

Iterate until the user approves the breakdown.

### 5. Write the issues to a file

Write the approved slices to `<FEATURE>_ISSUES.md` at the repository root, in dependency order (blockers first), each using the template below. `<FEATURE>` is a short UPPER_SNAKE_CASE name for the feature (e.g. `USER_SELECT_ISSUES.md`); if the source is a `<FEATURE>_PRD.md`, reuse its feature name. Number the issues and reference blockers by number.

Start the file with a header: a `# <Feature name>` title, a one-line summary, and a pointer to the source document (e.g. `USER_SELECT_PRD.md`) if there is one. If the file already exists, overwrite it (git has the history) and mention in your reply that you replaced it.

Publishing the issues anywhere else (issue tracker, etc.) is out of scope for this skill.

<issue-template>

## Issue <number>: <title>

Status: open

### What to build

A concise description of this vertical slice. Describe the end-to-end behavior, not layer-by-layer implementation.

Do NOT include specific file paths or code snippets — they go stale quickly. Exception: if a snippet encodes a decision more precisely than prose can (state machine, schema, type shape), inline the decision-rich parts here.

### Acceptance criteria

- [ ] Criterion 1
- [ ] Criterion 2

### Blocked by

- Issue <number>, or "None — can start immediately"

</issue-template>

Each issue starts with `Status: open`; whoever picks up an issue updates it to `in progress`, then `done`.
