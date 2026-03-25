---
name: code-review
description: 'Spin up a dedicated reviewer agent to run a strict quality review with a numeric score and pass/fail gate. Use when a user asks for a review, code review, feedback on code quality, or wants unnecessary abstractions removed.'
---

# Code Review

> *"Simplicity is the ultimate sophistication."* — Leonardo da Vinci

Two roles: a **reviewer** (always a fresh subagent) judges the code, and the **implementing agent** (you) applies fixes.

## When To Use

- User asks for a review or code review.
- User asks for feedback on code quality or design.
- User asks to simplify code or remove unnecessary abstraction.
- User asks for a scored quality gate before merge.

## Workflow

1. **Spawn a dedicated reviewer subagent.** Use `runSubagent`, `spawn_agent`, or whatever the platform provides (Claude, Codex, Copilot, etc.). The reviewer starts from fresh context, isolated from the implementation. Use `fork_context: false` unless missing context would invalidate the review. If delegation is unavailable, tell the user — do not silently self-review.
2. Give the reviewer only the changed files and the minimum context to understand them.
3. The reviewer scores against the rubric, applies the review rules, and returns the quality score block.
4. Surface the reviewer's result verbatim before acting on it — the user must see reviewer findings separately from fixer actions.
5. If the verdict is `fail`, the implementing agent treats `minimal_fix_plan` as a mandate and applies fixes with craft and care. Then resubmit to the reviewer.
6. After two failed cycles, stop and surface the unresolved choice clearly instead of iterating blindly.
7. Stop when the review passes or the user interrupts.

## Quality Score

The reviewer returns:

```text
score: X/100
verdict: pass|fail
metrics:
  simplicity: X/30
  abstraction_quality: X/30
  solid_design: X/15
  readability: X/25
findings:
  - [P0|P1|P2|P3] file:line — issue and why it matters
minimal_fix_plan:
  - fix 1
  - fix 2
```

No findings → `findings: - none`, `minimal_fix_plan: - none`.

For P0/P1 architectural findings, append:

```text
decision_memo:
  current_design: ...
  root_flaw: ...
  smallest_better_structure: ...
  why_now: ...
```

### Scoring

| Category | Weight |
|---|---|
| Simplicity and minimal code | 30 |
| Abstraction necessity and cohesion | 30 |
| SOLID and dependency direction | 15 |
| Readability and naming clarity | 25 |

`pass` requires score ≥ 90 with no automatic fail triggered.

### Severity

- `P0`: incorrect architecture or behavior with regression risk.
- `P1`: design flaw that should block merge.
- `P2`: meaningful maintainability or clarity issue.
- `P3`: minor issue that does not threaten the design.

### Automatic Fail

Any of these forces `fail` regardless of score:

- Abstraction added without present need.
- More code, layers, or state than the feature requires.
- Duplicate logic left when consolidation is straightforward.
- Symptom-level patch that leaves the root design smell intact.
- Tests do not cover changed behavior.
- Review does not explain the central design tradeoff.

## Review Rules

These govern the reviewer's judgment. Each principle stated once.

**Scope**: review only the current diff and the code quality of the behavior it implements. Do not invent future requirements or demand unrelated cleanup. Treat behavior changes as intentional unless they create internal contradictions, unnecessary complexity, unclear ownership, or broken code-level contracts inside the changed design. Prefer one root cause over multiple symptoms of the same flaw. A change is non-trivial when it touches multiple modules, reshapes a boundary, adds a shared abstraction, changes state ownership, or changes dependency direction — review architecture before implementation details for these.

**Priorities**: architectural and code-quality risks over style. Concrete file/line findings over general advice. Root-cause issues before surface-level ones.

**Simplicity**: treat added complexity as guilty until proven necessary. Penalize abstractions that don't remove real, present duplication or coupling. Prefer deletion over addition when behavior stays correct. Reward clarity and low maintenance cost, not cleverness. Apply SOLID only when it reduces coupling and cognitive load, not as ceremony.

**Architecture**: behavior belongs in the layer that owns the decision. Details depend on policies, never the reverse. Reject abstractions that mix orchestration with mechanics. One source of truth per decision, dependency, and state transition. Prefer the smallest coherent implementation that works today.

**Fix plan**: minimal and tied directly to findings. For architectural work, "minimal" means the smallest change that restores correct ownership and dependency direction — not the smallest diff. It is fine to state a flaw without knowing the perfect rewrite, but the finding must point toward the fix direction.

**Calibration**: review as if matching the user's instincts about code smell, not a generic style guide. Default to suspicion when code feels AI-shaped or prematurely generalized.

## Implementing Agent Standards

When the review fails, the implementing agent applies fixes with:

- **Craft**: every change leaves the codebase better than found.
- **Creativity**: make the problem dissolve, don't just address symptoms.
- **Quality**: no shortcuts — the fix reads as if written on a senior engineer's best day.
- **Ownership**: internalize the reviewer's bar. Treat findings as your own standards.
