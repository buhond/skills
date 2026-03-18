---
name: skill-auto-update
description: Keep agent skills aligned with durable feedback by distilling comments, corrections, and repeated guidance into the narrowest existing skill. Use on every turn, and especially when feedback reveals a reusable rule, a repeated miss, or a better abstraction that should replace a task-specific example.
---

# Skill Auto Update

Use this skill to keep project skills aligned with what feedback keeps teaching.

## Activation

This skill is most effective when the workspace `AGENTS.md` tells the AI to use it on every turn. Add a short rule such as: `Use $skill-auto-update on every turn to distill durable feedback into the narrowest existing skill.`
Treat routine use as a silent background check. Do not announce that you are using this skill unless it produces a user-relevant skill edit or the user explicitly asks about it.

## Run this loop

1. Scan the current turn for durable feedback signals such as user corrections, review comments, comments on issues or pull requests, repeated instructions, and explicit "do this / avoid this" guidance.
2. Ignore one-off facts, task-local preferences, and literal examples that do not imply a reusable rule.
3. Rewrite the signal as a principle: capture the idea, not the anecdote; state the invariant in one short sentence; prefer imperative wording such as `Prefer`, `Keep`, `Move`, or `Avoid`.
4. Translate taste or persona goals into concrete engineering rules; prefer `Keep functions small and cohesive` over `code like Uncle Bob`.
5. Update the narrowest existing skill that owns the rule: search for the same idea first, tighten an existing rule when it already exists, and create a new skill only when no current skill can contain the lesson cleanly.
6. When a new rule subsumes examples or sibling rules, delete or compress the older text instead of keeping both.
7. If the same rule is missed again, increase its score instead of adding another bullet.
8. If no durable lesson exists, make no skill edit and do not mention the check.

## Editing standard

- Keep skill text concise and imperative.
- Prefer strengthening an existing rule over adding a sibling rule that says the same thing differently.
- Prefer general rules over examples; if an example is necessary, keep one generic example only.
- When a rule, example, and score guidance overlap, keep the rule and only the minimum scoring detail needed: use no score for a fresh rule, start at ` [score: 2]` for the second clear miss, increment to a maximum of `5`, and never raise score for a mere style preference.
- Avoid historical commentary, changelogs, and case-specific prose.
