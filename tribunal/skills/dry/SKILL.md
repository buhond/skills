---
name: dry
description: "Keep each decision in one place. Apply when writing or reviewing code that repeats logic, recomputes a constant, or keeps two lists in step."
---

# DRY

Every decision lives in one place.

- **Flag the same decision written twice:** copied logic, a constant computed again, two lists that must change together. Keep one source, and make the others use it.
- **Judge by reason, not by look.** Two pieces of code that look alike but change for different reasons are not duplicates. Merging them is the worse mistake.
