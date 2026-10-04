# Social sign-in and garden lighting

Current scope: Google/GitHub sign-in was removed at the user's request on 2026-10-04; see [email-only requirements](email-auth-only.md). The social sections below record the earlier request. Day/night lighting and the visual refinements remain active.

Requested by the user on 2026-10-04, extending the original V1 scope.

## Social sign-in

Add Continue with Google and Continue with GitHub to both dedicated account pages, alongside the existing email form. Use Supabase OAuth with PKCE and a server callback that saves the session in cookies and opens `/garden`. Handle cancellation and failed callbacks with a useful sign-in message. Keep provider secrets in Supabase, never in browser configuration or Git.

Real provider sign-in requires Google/GitHub OAuth applications and both providers enabled in the hosted Supabase project. Browser tests can verify the provider redirect contract and callback errors; they do not prove real provider consent or hosted session persistence.

## Lighting

Default to Auto: Day from 06:00 inclusive to 18:00 exclusive, Night otherwise, using the device's local time. Refresh an open app when time changes and when it returns to the foreground. This visual clock is independent of the fixed account timezone used for daily completions.

Provide accessible Auto, Day, and Night controls across pages. Remember the preference in this browser; manual choices override the clock until Auto is selected again. Apply the saved setting before the first paint where possible, and handle unavailable browser storage without breaking the app.

Day keeps the sunny pixel scene. Night adds a pixel moon, twinkling stars, a shooting star, and moving fireflies. Keep sprites crisp and garden interactions readable. Smoothly transition the page palette, sky, and celestial elements when lighting changes. Respect reduced-motion preferences and keep ambient decoration out of the accessibility tree and pointer interactions.

Growth, daily completion, streaks, and guest/private data remain unchanged.

## Verification

Use the previously agreed public browser-flow seam for provider redirects, callback errors, device-time lighting, remembered manual choices, returning to Auto, responsive layout, and reduced motion. Re-run existing habit and auth checks before handoff. Record live provider setup limits in `current-status.md`.

## Visual refinement — 2026-10-04

The user requested actual Google/GitHub icons and a more attractive lighting toggle after reviewing the three-text-button control. Use self-hosted official provider artwork with recorded source attribution. Replace the three-option text strip with a sun/moon landscape switch and a separate visible Auto control. The switch selects the opposite effective lighting and leaves Auto; Auto restores device time. Preserve accessible switch state, keyboard operation, remembered choices, smooth transitions, reduced motion, and responsive layout. Authentication and habit behavior remain unchanged.

## Landing preview refinement — 2026-10-04

The user found the landing garden crowded, with eight large soil tiles and overlapping trees. Give the compact landing preview more breathing room: one inviting empty plot for a new garden, up to three actual plants for an existing garden, smaller scenery, and one short caption. Clearly label a partial preview when the garden contains more than three plants. Remove the redundant message below the frame. Preserve pixel rendering, day/night motion, accessible plot actions, and the complete My Garden scene. Verify desktop and narrow mobile layouts.
