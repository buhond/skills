---
name: folder-structure
description: Enforce one folder per export, named after it and nested by usage. Use when creating or moving files, components or modules, organizing a feature folder, reviewing a PR for structure, or when a user asks to audit, clean up, restructure, or fix a folder layout — even if they don't name this skill.
---

# Folder Structure

Every exported unit — component, class, hook, module or utility — gets its own folder, named after what it exports, with a same-named main file and its test beside it. Names follow the language's file convention: kebab-case in JavaScript and TypeScript, snake_case in Python, Ruby and Rust.

In TypeScript:

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

```
fruit-list
├── fruit-list.tsx
├── fruit-list.spec.tsx
└── fruit-item
    ├── fruit-item.tsx
    └── fruit-item.spec.tsx
```

**File names must match the export:**

```
Bad:  Loader/ProgressBar.tsx  (exports ProgressBar)
Good: progress-bar/progress-bar.tsx  (exports ProgressBar)
```

Renaming an export? Rename its file/folder in the same change.

**When reviewing a diff:** check every file it adds, renames or moves.

**When auditing or restructuring an existing folder:** before moving a file, grep for every import of it — moving it changes its relative import path everywhere. Move one export's files as a unit, fix imports, then move the next.

**Exceptions:** where the language or framework fixes the layout — Go packages, Java packages, Next.js `pages/`, tests kept in a separate tree like Python's `tests/` or Java's `src/test` — follow it and note why.
