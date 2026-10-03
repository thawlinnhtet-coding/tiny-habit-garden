# Issue tracker: GitHub

Specs and implementation tickets live in GitHub Issues for `thawlinnhtet-coding/tiny-habit-garden`.

Repository URL: https://github.com/thawlinnhtet-coding/tiny-habit-garden

Use the authenticated `gh` CLI. Specify `--repo thawlinnhtet-coding/tiny-habit-garden` when working outside this checkout. Inside the checkout, infer the repository from `origin`.

## Operations

- Read: `gh issue view <number> --comments`.
- List: `gh issue list --state open --json number,title,body,labels`.
- Create: `gh issue create --title "..." --body-file <file>`.
- Comment: `gh issue comment <number> --body-file <file>`.
- Edit: `gh issue edit <number> --body-file <file>`; add/remove labels with the corresponding flags.
- Close an implemented ticket only after its acceptance criteria and required checks pass; include the implementation commit and validation evidence.

Use an exact UTF-8 temporary file for multiline issue, comment, and PR bodies. Keep credentials out of commands and issue bodies. Use the GitHub connector if the CLI is unavailable and its tools support the operation.

## Specs and tickets

Follow `to-spec` to synthesize the user requirements. Follow `to-tickets` to draft complete vertical slices, review their granularity/dependencies, and publish one issue per approved slice.

Use native blocking dependencies when available. Each native edge refers to the blocker's numeric database ID, not its issue number. If dependencies are unavailable, list real blocking issue references in the issue body. Work only on tickets whose blockers are resolved.

Use the confirmed triage vocabulary in `triage-labels.md`. Apply `ready-for-agent` to fully specified specs and tickets.

When a skill says publish to the issue tracker, create a GitHub issue. When a skill says fetch a ticket, read its body and comments from GitHub. Local notes supplement the tracker rather than replace it.

## Pull requests as a request surface

PRs as a request surface: no.

External pull requests are not part of the feature-request triage queue unless the user explicitly changes this convention.
