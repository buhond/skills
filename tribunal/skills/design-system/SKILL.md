---
name: design-system
description: "Build UI from the repo's theme and shared components, and keep it accessible. Apply when writing or reviewing styles, colors, spacing, templates or UI components, on any platform."
---

# Design System

UI is built from the repo's theme and shared components. Find them first: the theme or token files, the UI library in the dependency file, the shared components folder.

- **Flag colors, spacing, sizes, fonts, breakpoints and shadows hard-coded** when the theme has a name for them.
- **Flag one-off styles** where a variant or prop already exists.
- **Flag custom components that redo a library or shared one.** Name the one to use.
- **Flag inaccessible UI:** images without alt text, inputs without labels, clickable things that aren't buttons or links, no keyboard or focus support.
