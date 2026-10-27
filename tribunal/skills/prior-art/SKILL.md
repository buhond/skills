---
name: prior-art
description: "Search before writing anything new: reuse the language, framework, dependencies and repo helpers, and follow the repo's existing shape. Apply when adding a helper, adapter, hook, form, schema, type, module or dependency."
---

# Prior Art

Search before you write. Most problems are already solved by the language, the framework, a dependency or the repo itself.

- **Flag code redoing what the standard library, framework, a dependency or a repo helper already does.** Name the replacement.
- **If nothing does the job yet, copy the nearest similar thing in the repo:** the closest adapter, hook, form, schema, migration or module. Flag a solved problem solved a new way, and name the file to copy.
- **Flag types and constants retyped by hand** when the repo generates or declares them elsewhere. Import the source.
- **Flag a new dependency** for what a few lines, or a dependency already there, can do.
