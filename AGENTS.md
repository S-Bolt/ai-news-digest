# AGENTS.md

## Purpose
This repository sends a daily AI news digest email.  
Keep changes focused, testable, and safe for scheduled runs in GitHub Actions.

## Project Shape
- Entry point: `index.js`
- Helpers: `helpers/`
  - `helpers/digest.js` (OpenAI/news collection)
  - `helpers/render.js` (plain text + HTML output)
  - `helpers/email.js` (SMTP send)
  - `helpers/utils.js` (shared pure helpers)
- Tests: `test/*.test.js` (Node built-in test runner)

## Runtime Rules
- Module system is ESM (`"type": "module"` in `package.json`).
- Always use explicit `.js` extensions in local imports.
- Do not introduce `src/` paths unless the project is intentionally restructured everywhere.
- Keep `index.js` as orchestration glue, not business logic.

## Required Commands
- Install: `npm ci`
- Run tests: `npm test`
- Run app: `npm start`

Before finishing any code change:
1. Run `npm test`.
2. If JS files changed, ensure syntax is valid (`node --check <file>` or equivalent).

## Refactor Boundaries
- Prefer small modules with clear responsibilities.
- Prefer dependency injection seams for external services (OpenAI, nodemailer) so tests can mock behavior.
- Preserve current behavior unless change is explicitly requested.
- Avoid broad rewrites when a targeted patch is sufficient.

## Env and Secrets
- Required environment variables:
  - `OPENAI_API_KEY`
  - `SMTP_HOST`
  - `SMTP_PORT`
  - `SMTP_USER`
  - `SMTP_PASS`
  - `EMAIL_FROM`
  - `EMAIL_TO`
- Never print secrets or full credential objects in logs.
- Do not commit `.env` values.

## Testing Guidance
- Add or update tests with any non-trivial behavior change.
- Minimum coverage targets:
  - `helpers/utils.js`: escaping + parsing behavior
  - `helpers/render.js`: content formatting and escaping
  - `helpers/digest.js`: JSON normalization and error paths (mock OpenAI client)
  - `helpers/email.js`: transport config and payload (mock transport)

## Output Quality
- Keep generated digest concise and link-backed.
- Prefer primary sources and reputable outlets.
- Ensure HTML output escapes untrusted strings.

## Git Hygiene
- Keep commits focused and readable.
- Do not revert unrelated user changes.
- If unexpected unrelated file changes appear, pause and ask before proceeding.
