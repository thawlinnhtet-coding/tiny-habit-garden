# Email-only authentication review

Reviewed commit: `b35aec7`. User-approved fixed point: `939a5d1`.

Both review axes reused the completed application reviews and inspected `4d2fded...b35aec7`. Sources: the user's request to remove social providers, GitHub issue #6, and `docs/email-auth-only.md`.

## Standards

Zero remaining documented-standard violations or actionable smell heuristics. The review caught a stale Google/GitHub requirement in the authoritative product document; commit `b35aec7` corrects it to email/password-only authentication and retains lighting.

## Spec

Zero findings. Provider buttons, OAuth initiation and settings requests, callback route, artwork, styles, and social-specific errors are removed. Email validation, confirmation callbacks, cookie sessions, sign-out, private gardens, and day/night lighting remain intact. The documentation correctly preserves the unresolved Supabase connectivity limitation.

## Verification

The existing public signup regression failed before removal because it found two provider buttons, then passed after implementation. Production build/typechecking, lint, formatting, 19 library tests, and all 26 remaining desktop/Pixel 7 browser checks passed. Desktop/mobile email-only screenshots were inspected. The production route list includes `/auth/confirm` and excludes `/auth/callback`.

Auth responses in browser checks are mocked. Real hosted email/session checks remain unverified because Supabase connection failures persist; removing social sign-in does not fix that connection. Hosted provider settings and existing users were not modified.

Summary: Standards 0 remaining findings; Spec 0 findings.
