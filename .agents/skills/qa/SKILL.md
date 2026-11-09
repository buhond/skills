---
name: qa
description: "QA a pull request in the running app: test every flow it changes as a user would, fix what's broken, test again, then add screenshots to the PR body. Use when asked to QA a PR, or to try or verify it in the app before merging."
argument-hint: "[PR number or URL, default: current branch]"
---

# QA

Prove the PR works for its users, in the running app, so it can merge with no one testing it again. CI runs the tests; you test what the tests don't.

## Plan

Read the PR's description, its linked issue and its diff. List what to test:

- Every flow the PR adds or changes, end to end, as its user does it.
- Its edge cases: empty, invalid, long or many inputs, a failing request, a user without permission, and each state it shows (loading, empty, error).
- Data and settings saved before the change, if it reads them, and its feature flag on and off, if it has one.
- The flows next to it that share its code, for regressions.

Nothing a user runs changed (only docs, tests or CI)? Say so and pass, with no screenshots.

## Ownership

You own the pull request when you are its author or an assignee (per the repo's PR tool, e.g. `gh pr view <PR> --json author,assignees` against `gh api user --jq .login`), or the user said in the conversation to change it anyway. A lookup that fails means not yours; say so in your report.

Not yours? You change nothing on it: in the Loop, report each bug instead of fixing it and end the Loop after the first round that finds one; host no screenshot on `qa-evidence`, and leave the PR body alone. Post one PR comment with the commit you tested, the verdict, what you tested, the bugs with how to reproduce them, and the screenshots you hosted, with no secret or real personal data. A security hole the base or default branch has too stays out of the comment; put it only in your report. Write the comment to a file outside the checkout and post it to that PR with the repo's PR tool (e.g. `gh pr comment <PR> --body-file`). Can't post it? Put the comment in your report instead.

## Before

Once, before round 1, in a separate worktree of the PR's merge base with the default branch (never the PR's checkout), run the app on that code and screenshot each state the PR adds or alters, at the size its users see, into a folder outside the checkout. A change with no UI: run its commands and keep the output. Stop that app before round 1.

## Loop

Repeat until a round finds no bug, at most 3 rounds:

1. **Run** the app as the repo's docs or skills say, on its current code: restart it after a fix unless it reloads. Use local or test data and accounts, never production, a real user's account, or real emails, payments or messages. Missing an account or data? Create it with the repo's seeds or through the app.
2. **Test** every item on the list as a user would, with the tool the repo's docs or skills name, else a browser or device automation tool you have; a change with no UI through what its users call (the CLI, the API, the library). Screenshot each state the change adds or alters as you reach it, matching its before screenshot, into the same folder.
   A bug is anything a user would call wrong: an error in the console, network or server log, a broken layout, a confusing message, a result that differs from what the PR says it does. A bug the base branch has too isn't the PR's: report it, don't fix it or count it.
3. **Fix** each bug at its cause, with a test that fails without the fix where the repo tests that code. Run the affected tests and commit. At the end of the round, `git push` (never forced); rejected, `git pull --rebase` and push again.

Each round retests the whole list: a fix can break what passed.

## Verdict

- **Pass**: a round found no bug, every item was tested, and the PR's head is still the commit you tested (`git fetch`; moved, run another round if you have one left).
- **Fail**: the last round still found a bug or ended on a commit that is no longer the head, or an item still couldn't be tested after you tried every way around it. Say which, what you tried, and what it takes.

Something in the way (the app won't start, no automation tool, an account or data you can't create)? It's not a fail yet: read the error and fix the setup, try another way to run the app, another tool, or another way to create what's missing. The goal is a pass, so give up only once nothing is left to try.

## Screenshots

On a pass:

1. Pair each state the change adds or alters, and each step of an interaction, in order: its before screenshot and its screenshot from the passing round, same view, size and data. A state the base branch lacks gets its before as the nearest screen, or a caption saying it is new. A change with no UI gets its commands and their output before and after instead.
2. Check each shows what its caption says, with no error, secret or real personal data. Retake any that don't.
3. Host them where the repo's docs say. Otherwise, by the host of the `origin` remote, which also gives `<owner>` and `<repo>`:
   - **Delta**, if `dt auth status` reports you logged in to that host: upload each with `curl -fsS -X POST -H "Authorization: Bearer $(dt auth token)" -H "Content-Type: image/png" --data-binary @<path> "https://<origin host>/<owner>/<repo>/api/assets?name=<PR number>-<short SHA tested>-<slug>.png"`, where `<slug>` is letters, digits and dashes, and link the `url` it returns. Send the token only to that host.
   - **GitHub**, if it is `github.com`: commit them under `<PR number>/` on the orphan branch `qa-evidence`, from a separate worktree (never the PR's checkout), with `[skip ci]` in the message, and push (rejected, rebase and push again). Link each as `https://github.com/<owner>/<repo>/raw/<SHA of that commit>/<PR number>/<file>.png`, so a later run can't change it.

   A screenshot you can't host (any other host, a failed upload or push, a response with no `url`) stays out of the PR body: list its path in your report instead.
4. Fetch the current PR body. Delete the `## QA` section an earlier run added: the `---` directly above it, if any, its heading, its commit line, bullets and screenshots. Keep everything else, including screenshots others added. Then end the body with a blank line, `---` and a `## QA` section: the commit you tested, what you tested in a few bullets, then a Before and After table with one row per pair, each hosted screenshot as `![<caption>](<url>)`.

Stop the processes you started. End with the verdict, what you tested, the bugs you fixed with their commits, the bugs you reported, and what's left.
