export type AuthIntent = "sign-in" | "sign-up";
export type AuthValues = { email: string; password: string; code: string };
export type AuthStep =
  | "credentials"
  | "signup-code"
  | "email-code"
  | "totp"
  | "recovery-email"
  | "recovery-code"
  | "new-password"
  | "missing-email";
export type AuthInputErrors = Partial<Record<keyof AuthValues, string>>;

export function getAuthInputErrors(
  input: AuthValues,
  intent: AuthIntent,
  step: AuthStep = "credentials",
): AuthInputErrors {
  const errors: AuthInputErrors = {};
  if (["credentials", "recovery-email", "missing-email"].includes(step)) {
    const email = input.email.trim();
    if (!email) errors.email = "Enter your email address.";
    else if (email.length > 254)
      errors.email = "Your email address must be 254 characters or fewer.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      errors.email = "Enter a valid email address.";
  }
  if (step === "credentials" || step === "new-password") {
    if (!input.password) errors.password = "Enter your password.";
    else if (
      (intent === "sign-up" || step === "new-password") &&
      input.password.length < 8
    )
      errors.password = "Choose a password with at least 8 characters.";
  }
  if (
    ["signup-code", "email-code", "totp", "recovery-code"].includes(step) &&
    !/^\d{6}$/.test(input.code.trim())
  )
    errors.code = "Enter the 6-digit verification code.";
  return errors;
}
