---
name: blast-radius
description: "Find what a change breaks outside its diff. Apply when reviewing a change to a signature, a shape, stored data, a config key, a flag or anything else other code reads."
---

# Blast Radius

A change is safe only if everything that relies on what it changed still works. Grep finds the callers; the job is what grep misses.

Name what the change changes that others rely on: a signature, a return shape, a default, an error, an order, a column or key, a wire or file format, an env var, a flag, an event. Then find each reader:

- callers and subclasses, tests and scripts included;
- data already in the old shape: stored rows, caches, queued jobs, messages, the old build still running during a deploy;
- code that reads it by name or as a string: other services, other languages, config, templates, docs;
- the change that has to ship with it: a migration, a config entry, a generated file, a doc.

Flag each reader that breaks, at its `file:line`, with what goes wrong. Never report "might break callers" without naming one. A broken reader or a missing companion change is a blocker.
