# tribunal

Code quality rules, one skill each, and `tribunal`: one subagent per rule reviews a diff, the findings get verified, and the code gets fixed until a run leaves nothing to apply.

## Install

Claude Code:

```
/plugin marketplace add buhond/skills
/plugin install tribunal@buhond
```

Cursor: add `buhond/skills` as a plugin marketplace and install `tribunal`.

## Use

`/tribunal` on a branch, or `/tribunal 5` to allow five cycles instead of three. It commits its fixes and never pushes.

Every other skill in [`skills/`](skills) is a rule, and applies while writing code too.
