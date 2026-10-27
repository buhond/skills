---
name: single-responsibility
description: "One unit, one job. Apply when writing, splitting or reviewing functions, components, classes or modules, and the direction of their imports."
---

# Single Responsibility

One unit, one job, one reason to change.

- **Flag units doing several jobs:** a component that fetches, transforms and renders; a function that decides and also does the I/O; anything you can't test without starting its dependencies. Split along the jobs.
- **Keep the core pure.** Business rules take data and return data. I/O, frameworks and side effects sit at the edge and call in. Flag business logic that imports the database, an HTTP client or the framework.
- **Imports point one way:** from the edge in, from features to shared code. Flag shared code importing a feature, and import cycles.
- **Flag flags, modes and boolean parameters added for one caller.** Give the caller smaller pieces to combine instead.
