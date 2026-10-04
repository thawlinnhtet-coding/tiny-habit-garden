# Landing preview spacing review

Reviewed commit: `0383e92`. User-approved fixed point: `939a5d1`.

Both review axes reused the completed application/icon/toggle reviews and inspected `edbb873...0383e92`. Source: the user's crowded landing screenshot and the landing-preview refinement in issue #6 and `docs/social-auth-and-lighting.md`.

## Standards

Zero documented-standard breaches or actionable smell heuristics. Compact-only changes preserve the full garden, accessible plot actions, crisp sprite scaling, and lighting behavior. Partial previews are labeled clearly.

## Spec

Zero findings. The compact preview limits plots, reduces scenery, labels larger gardens as partial previews, and removes redundant messaging. Pixel rendering, day/night motion, accessible plant actions, and the complete My Garden scene are preserved. No missing requirements, scope creep, or confirmed regressions found.

## Verification

Production build/typechecking, lint, formatting, 19 library tests, and all 34 desktop/Pixel 7 browser checks passed. The full browser run used two workers and passed without retries. Desktop day/night and a narrow 320px mobile layout were visually inspected; the narrow layout has no horizontal overflow. The existing landing browser flow captures desktop/mobile page and preview screenshots.

Real Google/GitHub provider consent and hosted sessions remain pending user configuration, independently of this visual update.

Summary: Standards 0 findings; Spec 0 findings.
