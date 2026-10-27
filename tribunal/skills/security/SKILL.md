---
name: security
description: "Treat every input from outside as hostile. Apply when writing or reviewing endpoints, actions, queries, file or URL handling, auth, secrets, logging or new dependencies."
---

# Security

Every input from outside is hostile until checked: users, other services, files, URLs, and any data users wrote earlier.

Flag:

- **Injection:** input reaching SQL, a shell, HTML, a template, a file path, a regex or a redirect without parameters or escaping.
- **Missing access checks:** every endpoint and action checks that this user may touch this record, not only that someone is logged in.
- **Mass assignment:** request fields copied straight onto a model.
- **Server requests to URLs the user controls** (SSRF).
- **Secrets** in code, logs, error messages, URLs or the client bundle.
- **Sensitive data** returned or logged beyond what the caller needs.
- **Weak crypto:** home-made crypto, fast hashes for passwords, secrets compared with `==` instead of a constant-time compare, guessable tokens.
- **Missing CSRF protection** on state-changing requests in cookie-based apps.
- **No limits:** no cap on upload size, body size, page size, request rate or expensive work.
- **Risky new dependencies:** unmaintained, unknown, or far bigger than the job.

An exploitable path is a blocker.
