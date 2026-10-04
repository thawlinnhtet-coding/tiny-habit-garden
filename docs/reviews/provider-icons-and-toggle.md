# Provider icons and lighting toggle review

Reviewed commit: `ece3e6e`. User-approved fixed point: `939a5d1`.

The two review axes reused the previous application review and inspected `11402fc...ece3e6e`. Source: the user's visual feedback, issue #6, and the visual-refinement section of `docs/social-auth-and-lighting.md`.

## Standards

Zero documented-standard violations or actionable smell heuristics. The switch preserves keyboard access, accessible state, remembered preferences, and reduced motion. Official provider artwork is self-hosted and attributed.

## Spec

Zero findings. The landscape switch chooses the opposite effective lighting and leaves Auto; the separate Auto control restores device time. Google/GitHub marks replace the placeholder glyphs. No confirmed regressions or scope creep.

## Verification

Production build/typechecking, lint, formatting, and 19 library tests pass. All 34 desktop/Pixel 7 browser checks are verified: 33 passed in the full production run and one passed on targeted rerun. The failed trace showed the initial page load consumed nearly 26 seconds of the 30-second test budget; its rerun passed in 3.6 seconds. An earlier eight-worker development run hit seven timeouts; production testing used two workers. No application code changed to hide failures.

Desktop/mobile provider buttons and day/night controls were visually inspected. Real provider consent and hosted session persistence still require provider configuration and remain pending.

Summary: Standards 0 findings; Spec 0 findings.
