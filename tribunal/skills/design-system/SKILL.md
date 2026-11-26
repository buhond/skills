---
name: design-system
description: "Build UI from the repo's theme and shared components, and keep it accessible. Apply when writing or reviewing styles, colors, spacing, templates or UI components, on any platform."
---

# Design System

UI is built from the repo's theme and shared components. Find them first: the theme or token files, the UI library in the dependency file, the shared components folder.

- **Confirm where new UI lives** (an existing surface or a new page) before building it.
- **Flag colors, spacing, sizes, fonts, breakpoints and shadows hard-coded** when the theme has a name for them.
- **Flag one-off styles** where a variant or prop already exists.
- **Flag custom components that redo a library or shared one.** Name the one to use.
- **Button and link labels name the action and its object** ("Run review now", not "Start anyway"); a state the UI shows always says why.
- **Keep UI lean:** hide zero counts and empty states; tuck secondary lists behind a collapsed icon in the section they belong to.
- **Flag inaccessible UI:** images without alt text, inputs without labels, clickable things that aren't buttons or links, no keyboard or focus support.
- **A UI change or revert covers every surface that renders that component** (single, stacked, sidebar, header), never just the first one found.
