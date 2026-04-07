---
name: linear-ticket-pr
description: Turn local work into one or more small PRs by splitting coherent chunks, creating a branch for each chunk, creating a Linear issue when Linear is available, and titling the PR from the ticket key such as `GENG-1234 - Fix something`.
---

# Linear Ticket PR

Keep the flow small and direct. This skill handles the whole local diff by turning it into the smallest coherent PRs it can infer on its own.

## Workflow

1. Define coherent chunks.
   - Inspect everything not on `origin/main`, including committed work, staged changes, unstaged changes, and untracked files.
   - Stop immediately if there is no change beyond `origin/main`.
   - Split mixed work into the smallest coherent chunks that can each ship as one reviewable PR.
   - Group files by the behavior they change, not by git state.
   - Process one chunk at a time until the full local diff is published.

2. Create the branch for that chunk.
   - Start from the branch that already contains the chunk, or create a new branch if still on a default branch.
   - Use one short descriptive branch name and keep it stable.

3. Create the Linear ticket if Linear is accessible.
   - Infer the owning team from the touched paths and the diff summary.
   - If Linear tools are available and the team can be inferred, create one issue for the chunk.
   - Keep the ticket simple: one sentence title, short motivation, short validation plan.
   - Do not force project selection.
   - Capture the returned issue key exactly, for example `GENG-1234`.
   - If Linear is unavailable or the team cannot be inferred confidently, continue without inventing a ticket key.

4. Publish the chunk.
   - Stage only the files that belong to the chunk.
   - Commit with a title that matches the future PR title.
   - Push the branch and open one draft PR for the chunk.
   - If an issue key exists, prefix the PR title with it, for example `GENG-1234 - Fix field configuration select`.
   - Otherwise use the plain title.

## Guardrails

- Do not leave unrelated changes in the same PR when they can be separated cleanly.
- Do not split files mechanically; split by behavior.
- Do not force a Linear project or fabricate a ticket key.
- Do not push or open the PR before the chunk is staged and committed.
- Do not rename the branch after creating it.
- Do not create duplicate branches, tickets, or PRs for the same chunk.

## Example Requests

- `Use $linear-ticket-pr to split my local changes into small PRs, create the right branches, create Linear tickets when possible, and open the PRs.`
- `Use $linear-ticket-pr to turn everything not on origin/main into the smallest reviewable PRs and prefix each PR title with the Linear key when one exists.`
