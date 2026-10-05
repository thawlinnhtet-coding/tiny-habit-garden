# Email-only authentication

Superseded on 2026-10-05 by [Clerk authentication](clerk-auth.md). This document records the earlier email-only Supabase Auth release.

Requested by the user on 2026-10-04: “so please remove that social provider.” This supersedes the Google/GitHub sign-in portion of issue #6.

Remove Google and GitHub sign-in from both account pages, including the social flow, provider artwork, divider, styles, OAuth callback route, and social-specific error messages. The application must no longer request `/auth/v1/settings` to start authentication.

Keep email/password sign-in and sign-up, inline field validation, email confirmation through `/auth/confirm`, cookie sessions, sign-out, and private garden behavior. Day/night lighting, its toggle, pixel scenery, and habit data remain unchanged.

Update the README and current project status. Mark earlier social setup instructions as superseded. Verify the change through the existing public auth/browser seam, including the absence of provider buttons and preserved email flows; re-run the garden and lighting checks.

This removes the application feature. Hosted Supabase dashboard settings and existing user accounts are not modified. The previously observed endpoint connection failures are not resolved by removing the social feature; live email/session validation still requires a reachable Supabase project.
