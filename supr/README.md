# supr

Code quality rules, one skill each, and `tribunal`: one subagent per rule reviews a diff, the findings get verified, and the code gets fixed until a run leaves nothing to apply.

## Install

Claude Code:

```
/plugin marketplace add buhond/skills
/plugin install supr@buhond
```

Cursor: add `buhond/skills` as a plugin marketplace and install `supr`.

## Use

`/tribunal` on a branch, or `/tribunal 5` to allow five cycles instead of three. It commits its fixes and never pushes.

The rules also apply while writing code: `kiss`, `folder-structure`, `single-responsibility`, `dry`, `prior-art`, `design-system`, `state-ownership`, `type-safety`, `performance`, `correctness`, `security`, `clarity`, `no-comments`, `test-coverage`.
