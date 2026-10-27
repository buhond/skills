---
name: single-responsibility
description: "One unit, one job. Apply when writing, splitting or reviewing functions, components, hooks or modules — especially ones that fetch, transform and render, or grow flags and options for one caller."
---

# Single Responsibility

One unit, one job.

- Flag units doing several: a component that fetches, transforms and renders; a function mixing orchestration with the mechanics it orchestrates; anything untestable without standing up its dependencies. Split it along its jobs.
- Serving one caller is a job the unit took from that caller. Every flag, mode, option, branch, name or import it grew for one caller — every boolean parameter that picks behavior included — goes back to that caller, to assemble from smaller pieces.
