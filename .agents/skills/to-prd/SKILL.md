---
name: to-prd
description: Turn the current conversation into a PRD written to <FEATURE>_PRD.md — no interview, just synthesis of what has already been discussed.
disable-model-invocation: true
---

Turn the current conversation and codebase understanding into a PRD. Do NOT interview the user — synthesize what you already know. If something essential is genuinely missing, note it under Further Notes rather than asking.

## Process

1. Explore the repo to understand the current state of the codebase, if you haven't already. Use the project's existing vocabulary and conventions throughout the PRD.

2. Write the PRD to `<FEATURE>_PRD.md` at the repository root using the template below, where `<FEATURE>` is a short UPPER_SNAKE_CASE name for the feature (e.g. `USER_SELECT_PRD.md`). If that file already exists, overwrite it (git has the history) and mention in your reply that you replaced it.

Publishing the PRD anywhere else (issue tracker, docs, etc.) is out of scope for this skill.

<prd-template>

# <Feature name>

A one-or-two-sentence summary of the feature, so the file is self-explanatory without the conversation context.

## Problem Statement

The problem the user is facing, from the user's perspective.

## Solution

The solution to the problem, from the user's perspective.

## User Stories

A numbered list of user stories covering all aspects of the feature, each in the format:

1. As an <actor>, I want <feature>, so that <benefit>

## Implementation Decisions

The implementation decisions that were made, such as:

- The modules that will be built or modified, and their interfaces
- Architectural decisions
- Schema changes and API contracts
- Technical clarifications from the developer

Do NOT include specific file paths or code snippets — they go stale quickly. Exception: if a snippet encodes a decision more precisely than prose can (state machine, schema, type shape), inline the decision-rich parts within the relevant decision.

## Testing & Acceptance

The testing decisions that were made, and what "done" looks like:

- Acceptance criteria: a short list of verifiable statements — the feature is done when each of these can be observed
- What makes a good test (test external behavior, not implementation details)
- Which modules will be tested
- Prior art for the tests (similar tests in the codebase)

## Out of Scope

The things that are out of scope for this PRD.

## Further Notes

Any further notes, including open questions or missing information.

</prd-template>
