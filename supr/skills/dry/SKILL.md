---
name: dry
description: "Keep each decision in one place. Apply when writing or reviewing code that repeats logic, re-derives a constant, or keeps two lists in step."
---

# DRY

Every decision lives in one place.

- Flag one decision written twice: duplicated logic, a re-derived constant, two lists that must stay in step. Keep one source and make the others depend on it.
- Judge by cause, not shape. Folding together two things that merely look alike today is the worse defect: they change for different reasons.
