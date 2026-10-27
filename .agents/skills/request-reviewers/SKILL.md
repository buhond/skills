---
name: request-reviewers
description: "Request the best reviewers for a pull request, owners of the touched code and never the author, then ask for a review in the owning team's Slack channel. Use when a PR needs reviewers, or when asked who should review it."
argument-hint: "[PR number or URL, default: current branch]"
---

# Request Reviewers

Request one or two reviewers who own the code the PR touches, then ask their team on Slack.

1. Skip a draft, and a PR that already has reviewers.
2. Find the owners of the touched files: the ownership tool the repo's docs or skills name, else `CODEOWNERS`, else the most recent authors of those files, by their host login (e.g. `gh api 'repos/{owner}/{repo}/commits?path=<file>' --jq '.[].author.login'`).
3. Prefer whoever owns the most of the diff. Never the author, never a bot.
4. Request them with the repo's PR tool, else `gh pr edit --add-reviewer`.
5. Find the owning team's Slack channel: the repo's docs or `CODEOWNERS`, the team's page in the ownership tool, else a Slack search for the channel where that team's PRs are already posted. Found none for sure? Skip the post. Never guess a channel.
6. Search that channel for the PR's URL. Already posted? Stop.
7. Post with the Slack tool the session has (MCP or tool gateway):

   > Hi {team}, could someone take a look at this PR when you have a moment? {PR link} :pray:

   Mention the requested reviewers only if the team's channel does that. No Slack tool? Give the user the message and the channel instead.
