---
name: folder-structure
description: Enforce this repo's front-end folder and file structure conventions. Use when creating or moving front-end files or components, organizing a feature folder, reviewing a front-end PR for structure, or when a user asks to audit, clean up, restructure, or fix a folder layout — even if they don't name this skill.
---

# Folder Structure

Every exported component, hook, or utility gets its own kebab-case folder, named after what it exports, with a same-named main file and colocated test.

**Bad:**

```
user-profile
├── user-profile.tsx
├── user-profile.spec.tsx
├── user-avatar.tsx
├── user-avatar.spec.tsx
├── user-label.tsx
└── user-label.spec.tsx
```

**Good:**

```
user-profile
├── user-profile.tsx
├── user-profile.spec.tsx
├── user-avatar
│   ├── user-avatar.tsx
│   └── user-avatar.spec.tsx
└── user-label
    ├── user-label.tsx
    └── user-label.spec.tsx
```

**Nest by usage.** If something is only used by one parent, put it inside that parent's folder — don't leave it as a sibling or lift it to a shared location. Only promote it out once a second, unrelated parent needs it.

**File names must match the export**, in kebab-case:

```
Bad:  Loader/ProgressBar.tsx  (exports ProgressBar)
Good: progress-bar/progress-bar.tsx  (exports ProgressBar)
```

Renaming an export? Rename its file/folder in the same change.

**When auditing or restructuring an existing folder:** before moving a file, grep for every import of it — moving it changes its relative import path everywhere. Move one export's files as a unit, fix imports, then move the next.

**Exceptions:** if a framework forces a flat directory (e.g. Next.js `pages/`), don't fight it — just note why.
