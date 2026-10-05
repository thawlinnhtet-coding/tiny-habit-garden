# Clerk authentication migration review

Reviewed source: `5d36d6c`. User-approved fixed point: `939a5d1`.

Both axes reused completed reviews through `b35aec7` and inspected `542dbae...5d36d6c`. Source: the user's Clerk/Google/GitHub request, their development-mode decision, issue #7, and `docs/clerk-auth.md`.

## Standards

Zero remaining documented-standard violations or actionable smell heuristics. The initial review found a P2 race: the active Clerk session could change while a private write retrieved its token. The fix captures the session and independently rejects a token subject different from the garden's owner before HTTP. Supabase remains responsible for signature verification and database ownership checks.

## Spec

Zero findings. Clerk owns authentication and provider artwork, sessions supply private database identity, errors preserve unavailable/private mode, and existing data is retained with guarded administrator transfers. Configured Clerk UI, verification codes, social consent, hosted integration, and legacy account mappings are explicitly pending. The rollout gate keeps production unchanged.

## Verification

Production build/typechecking, lint, formatting, and all 13 library tests pass. The desktop/Pixel 7 production browser run passed 20 checks; 2 configured Clerk UI checks are explicitly skipped because keys are absent. That run verified the unchanged guest, lighting, landing, and missing-configuration flows; the subsequent private-token race fix was verified through public garden operations and a fresh build. Runtime dependency audit reports zero vulnerabilities.

The PostgreSQL owner regression failed with an invalid UUID before the text-subject migration, then passed. Local PostgreSQL verifies Clerk CRUD/watering, daily duplicate protection, cross-owner rejection, direct-table isolation/write denial, anonymous rejection, preserved legacy plants/completions, and guarded administrator transfers retaining timezone and progress.

The account-switch regression failed before the fix because the create resolved under the new account token. Afterward, a mismatched subject triggers zero outgoing HTTP calls, while the captured owner's token creates the plant successfully. This uses the real Supabase client and an external HTTP stub; it does not validate hosted Clerk or Supabase services.

Actual Clerk UI/icon appearance, email codes, OAuth consent, sign-out/sessions, hosted database persistence/isolation/concurrency, and real owner mappings still require configured/live validation. Keys/native integration/migration are pending user setup. See `docs/clerk-setup.md`.

Summary: Standards 0 remaining findings; Spec 0 findings.
