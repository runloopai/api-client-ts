# Agent Guidance

## Pull Request Hygiene

- Use Conventional Commits format for PR titles and commit subjects. Follow https://www.conventionalcommits.org/en/v1.0.0/#summary with a lowercase type, optional scope, colon, and short imperative summary, for example `fix(devbox): remove stale helper argument`.
- Match the repository's existing release style when choosing a type and scope. Prefer `fix(scope): ...`, `feat(scope): ...`, `docs(scope): ...`, or `chore(scope): ...` as appropriate.
- When asked to create, open, or update a PR, do not hand the turn back to the user until the branch is pushed, the PR is open or updated, relevant local validation has run where practical, and GitHub CI is passing.
- If CI cannot pass because of an external service, permissions, unavailable secrets, or another blocker outside the branch changes, report the blocking check with a link and a concise explanation.

## Generated Code

- Most SDK code is generated. Prefer fixing generated API surfaces at the OpenAPI/Stainless source when possible.
- Keep handwritten changes small and clearly separated from generated updates so future generations can be reviewed safely.
