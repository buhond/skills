---
name: code-review
description: 'Spin up a dedicated reviewer agent to run a strict quality review with a pass/fail gate and a minimal root-cause fix plan. Use when asked to review code, a diff, or a PR, for feedback on code quality or design, or for a quality gate before merge.'
---

# Code Review

Two roles: a **reviewer** (always a fresh subagent) judges the code, and the **implementing agent** (you) applies fixes.

## Workflow

1. **Spawn a fresh reviewer subagent** with no context from the implementation, so the review stays independent of the work. If delegation is unavailable, tell the user — do not silently self-review.
2. Give the reviewer only the changed files and the minimum context to understand them.
3. Surface the reviewer's result verbatim before acting on it — the user must see reviewer findings separately from fixer actions.
4. On `fail`, treat `minimal_fix_plan` as a mandate and apply the fixes, then resubmit to the reviewer.
5. After two failed cycles, stop and surface the unresolved choice clearly instead of iterating blindly.

## Verdict

The reviewer returns:

```text
verdict: pass|fail
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

### Severity

- `P0`: incorrect architecture or behavior with regression risk.
- `P1`: design flaw that should block merge.
- `P2`: meaningful maintainability or clarity issue.
- `P3`: minor issue that does not threaten the design.

### Fail

Any of these means `fail`:

- Abstraction added without present need.
- More code, layers, or state than the feature requires.
- Duplicate logic left when consolidation is straightforward.
- Symptom-level patch that leaves the root design smell intact.
- Tests do not cover changed behavior.
- The review does not explain the central design tradeoff.

## Review Rules

These govern the reviewer's judgment. Apply the `kiss` skill as the simplicity bar. Judge in this order: simplicity, abstraction necessity, readability and naming, then SOLID and dependency direction.

**Scope**: review only the current diff and the code quality of the behavior it implements. Do not invent future requirements or demand unrelated cleanup. Treat behavior changes as intentional unless they create internal contradictions, unnecessary complexity, unclear ownership, or broken code-level contracts inside the changed design. Prefer one root cause over multiple symptoms of the same flaw. A change is non-trivial when it touches multiple modules, reshapes a boundary, adds a shared abstraction, changes state ownership, or changes dependency direction — review architecture before implementation details for these.

**Priorities**: architectural and code-quality risks over style. Concrete file/line findings over general advice. Root-cause issues before surface-level ones.

**Architecture**: behavior belongs in the layer that owns the decision. Details depend on policies, never the reverse. Reject abstractions that mix orchestration with mechanics. One source of truth per decision, dependency, and state transition. Prefer the smallest coherent implementation that works today. Apply SOLID only where it reduces coupling and cognitive load, never as ceremony.

**Fix plan**: minimal and tied directly to findings. For architectural work, "minimal" means the smallest change that restores correct ownership and dependency direction — not the smallest diff. It is fine to state a flaw without knowing the perfect rewrite, but the finding must point toward the fix direction.
