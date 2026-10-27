---
name: security
description: "Treat every input from outside the process as hostile. Apply when writing or reviewing endpoints, actions, queries, file or URL handling, secrets or logging."
---

# Security

Every input from outside the process is hostile.

- Flag input reaching a query, shell, HTML, file path or URL unchecked.
- Flag endpoints and actions missing authorization.
- Flag secrets in code, logs or the client bundle.
- Flag sensitive data returned or logged beyond what the caller needs.
- An exploitable path is a blocker.
