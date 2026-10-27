---
name: prior-art
description: "Search before writing anything new: reuse the language, framework, dependencies and repo helpers, and follow the repo's existing shape. Apply when adding a helper, adapter, hook, form, schema, type or module."
---

# Prior Art

Nothing is new until you have searched.

- Flag code redoing what the language, the framework, a declared dependency or a repo helper already does, and name the replacement.
- Where nothing does the job yet, the repo still says how it is done: read the nearest thing of the same kind — adapter, hook, form, schema, migration, module layout — and copy its shape. Flag shape that answers a solved problem its own way, naming the file to copy.
- Types and constants restating what the repo generates or declares elsewhere are the same defect: depend on the source, don't retype it.
