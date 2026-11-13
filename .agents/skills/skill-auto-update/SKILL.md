---
name: skill-auto-update
description: Turn failures, misses and feedback into one durable rule. Use on the word "retro", or when something didn't work or wasn't caught (user correction, missed review comment, wrong claim, failed merge), or the user repeats guidance. Not a routine every-turn check.
---

# Skill Auto Update

Keep skills and memory aligned with what failures and feedback teach.

## Activation

Run on "retro", or when a turn contains a failure or miss: a correction, a repeated instruction, a missed comment, a wrong claim, a failed action. Not on every turn.

## Loop

1. Find the miss. Ignore one-off facts and task-local preferences.
2. Write ONE general rule: imperative, one short sentence, no anecdote.
3. Save it in the narrowest durable place that owns it:
   - the relevant skill (tighten an existing rule before adding one);
   - the tool's own prompt or skill (e.g. Supr);
   - the bot's memory via `bot_update_state`, when no skill owns it.
4. Create a new skill only when none can hold the rule cleanly. If a new rule subsumes older text, delete the older text.
5. Repeat miss: raise ` [score: N]` on the rule (starts at 2, max 5) instead of adding another.
6. Tell the user the rule in one line.
7. No durable lesson: make no edit and say nothing.

## Examples

- Review body with no inline thread was missed -> `A review body with no inline thread is a comment too.`
- Defended a design choice unchecked -> `Check the reference product before defending a design choice.`
- Reported a PR merged unchecked -> `Verify state (gh/dt) before reporting it.`

## Style

Concise, imperative, general. No history or changelogs.
