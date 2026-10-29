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

## Loop

Repeat until a round finds no bug, at most 3 rounds:

1. **Run** the app as the repo's docs or skills say, on its current code: restart it after a fix unless it reloads. Use local or test data and accounts, never production, a real user's account, or real emails, payments or messages. Missing an account or data? Create it with the repo's seeds or through the app.
2. **Test** every item on the list as a user would, with the tool the repo's docs or skills name, else a browser or device automation tool you have; a change with no UI through what its users call (the CLI, the API, the library). Screenshot each state the change adds or alters as you reach it, at the size its users see, into a folder outside the checkout.
   A bug is anything a user would call wrong: an error in the console, network or server log, a broken layout, a confusing message, a result that differs from what the PR says it does. A bug the base branch has too isn't the PR's: report it, don't fix it or count it.
3. **Fix** each bug at its cause, with a test that fails without the fix where the repo tests that code. Run the affected tests and commit. At the end of the round, `git push` (never forced); rejected, `git pull --rebase` and push again.

Each round retests the whole list: a fix can break what passed.

## Verdict

- **Pass**: a round found no bug, every item was tested, and the PR's head is still the commit you tested (`git fetch`; moved, run another round if you have one left).
- **Fail**: round 3 still found a bug or ended on a commit that is no longer the head, or an item couldn't be tested (the app won't start, no automation tool, an account you can't create). Say which, and what it takes.

## Screenshots

On a pass:

1. Pick from the passing round's screenshots: each state the change adds or alters, and each step of an interaction, in order. Add one from the base branch only when the new one alone doesn't show the difference. A change with no UI gets its commands and their output instead.
2. Check each shows what its caption says, with no error, secret or real personal data. Retake any that don't.
3. Host them where the repo's docs say. Otherwise, on the forge of the `origin` remote:
   - **Delta**: upload each with `curl -fsS -X POST -H "Authorization: Bearer $(dt auth token)" -H "Content-Type: image/png" --data-binary @<path> "https://<origin host>/<owner>/<repo>/api/assets?name=<name>.png"`, where `<name>` is a short slug of letters, digits and dashes, and link the `url` it returns. Send the token to no other host.
   - **GitHub**: commit them under `<PR number>/` on the orphan branch `qa-evidence`, from a separate worktree (never the PR's checkout), with `[skip ci]` in the message, and push (rejected, rebase and push again). Link each as `https://github.com/<owner>/<repo>/raw/<SHA of that commit>/<PR number>/<file>.png`, so a later run can't change it.

   A failed upload, or a response with no `url`, means that screenshot isn't hosted: list its path in your report instead.
4. If an earlier run added a QA section, delete it: from its `---` rule to the end of the body. Keep everything before it, including screenshots others added. Then end the body with `---` and a `## QA` section: the commit you tested, what you tested in a few bullets, then each screenshot as `![<caption>](<url>)`.

Stop the processes you started. End with the verdict, what you tested, the bugs you fixed with their commits, and what's left.
