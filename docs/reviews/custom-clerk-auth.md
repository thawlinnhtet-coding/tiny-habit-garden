# Custom Clerk account pages review

Reviewed implementation: `002596924a04639f55fb7d5539e331ec51d9c896`.
User-approved fixed point: `939a5d1`.
Comparison: `git diff 939a5d1...0025969`; prior reviews were reused, with the new manual-auth delta reviewed independently along both axes.

## Standards

Zero remaining findings. The initial review identified a resumed unsupported verification factor incorrectly defaulting to an email code. The fix shares selection between initialization and advancement; only advertised TOTP/email factors are selected, and unsupported factors show an explicit error. The related possible Repeated Switches concern is resolved.

## Spec

Zero remaining findings. Dedicated manually written login/signup forms replace Clerk prebuilt screens. Original provider artwork, inline errors, signup codes, recovery, device trust, CAPTCHA, and social continuation remain. Extra dashboard requirements and unsupported factors/tasks are reported explicitly.

## Evidence and limits

- The browser form regression failed on the prior UI because the manual Email field was absent, then passed on desktop and Pixel 7.
- All 16 library tests and all 24 browser checks passed. Browser checks used a deliberately unconfigured production build to exercise custom inputs and the guest garden independently of external SDK connectivity; local credentials were preserved.
- Desktop/mobile day/night screenshots were inspected, including loaded brand and pixel assets.
- Builds pass both without Clerk and with the configured development keys. Lint/typechecking/formatting pass. The verification-factor fix was checked with lint/typechecking and a fresh configured production build.
- Both Clerk keys are present locally, but a direct public SDK request timed out and the real configured browser could not load authentication. Email/OTP/recovery/OAuth success, device trust, hosted persistence, native integration, and legacy mapping still need live verification. No account, hosted migration, or user transfer was performed during these UI checks.

Standards: 0 findings. Spec: 0 findings.
