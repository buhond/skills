---
name: skill-auto-update
description: Distill durable feedback into the narrowest existing skill. Use when the user corrects a convention, repeats guidance, a review comment reveals a reusable rule, something failed or was missed (wrong claim, missed comment, failed merge), or the user says 'retro'; 'retro on this session' runs a full session retro. Not a routine every-turn check.
---

# Skill Auto Update

Use this skill to keep project skills aligned with what feedback keeps teaching.

## Activation

Run this when a turn contains durable feedback: a correction, a repeated instruction, a review comment that implies a reusable rule, or a failure or miss (something didn't work or wasn't caught). The word 'retro' triggers it explicitly. Do not run it as a routine check on every turn.

Treat it as a silent background pass. Announce only the one-line rule it produces, or when the user asks.

## Run this loop

1. Scan the current turn for durable feedback signals such as user corrections, review comments, comments on issues or pull requests, repeated instructions, and explicit "do this / avoid this" guidance.
2. Ignore one-off facts, task-local preferences, and literal examples that do not imply a reusable rule.
3. Check before rule: if a test, lint, CI check, or Supr/prompt change could catch the miss, build or propose that check first and stop. Only judgement calls go on.
4. Rewrite the signal as a principle: capture the idea, not the anecdote; state the invariant in one short sentence; prefer imperative wording such as `Prefer`, `Keep`, `Move`, or `Avoid`.
5. Translate taste or persona goals into concrete engineering rules; prefer `Keep functions small and cohesive` over `code like Uncle Bob`.
6. Update the narrowest existing skill that owns the rule: search for the same idea first, tighten an existing rule when it already exists, and create a new skill only when no current skill can contain the lesson cleanly.
7. If the same rule is missed again, increase its score instead of adding another bullet.
8. Prune: delete rules that are obsolete, duplicated, never triggered, or now enforced by a check; shorten and merge the rest. Fewer, sharper rules.
9. Update the index `home/dimitri-buhon/skills/RULES.md` in the active World checkout (not beside this skill; the packaged skill bundle lacks it): one line per rule, linking the skill or memory that holds it. Ship the change through a PR. Tell the user the rule in one line, even when it goes into a bot's memory or another prompt instead of a skill.
10. If no durable lesson exists, make no skill edit and do not mention the check.

## Session retro

On 'retro on this session':

1. Read the session.
2. List improvements, most severe first, in these areas: navigation (slow to find something), automated checks (a mistake a check could catch), tool and token economy (expensive or repeated calls), no-op instructions to delete, missing access to information.
3. Apply only the ones the user approves.

A weekly automation runs the prune step over every skill and opens a PR only when something should go.

## Editing standard

- Keep skill text concise and imperative.
- A rule must apply beyond the case that caused it: no PR numbers, names or incident dates.
- If it can't be generalized, don't save it.
- Merge with an existing rule instead of adding a near-duplicate.
- Keep each rule to one short line; if an example is necessary, keep one generic example only.
- When a rule, example, and score guidance overlap, keep the rule and only the minimum scoring detail needed: use no score for a fresh rule, start at ` [score: 2]` for the second clear miss, increment to a maximum of `5`, and never raise score for a mere style preference.
- Avoid historical commentary, changelogs, and case-specific prose.
