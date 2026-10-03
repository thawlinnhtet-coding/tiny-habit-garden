export type AuthIntent = "sign-in" | "sign-up";

export type AuthCredentials = {
  email: string;
  password: string;
};

export type AuthInputErrors = Partial<Record<keyof AuthCredentials, string>>;

export function getAuthInputErrors(
  input: AuthCredentials,
  intent: AuthIntent,
): AuthInputErrors {
  const errors: AuthInputErrors = {};
  const email = input.email.trim();

  if (!email) errors.email = "Enter your email address.";
  else if (email.length > 254)
    errors.email = "Your email address must be 254 characters or fewer.";

  if (!input.password) errors.password = "Enter your password.";
  else if (intent === "sign-up" && input.password.length < 8)
    errors.password = "Choose a password with at least 8 characters.";

  return errors;
}

export function validateAuthInput(
  input: AuthCredentials,
  intent: AuthIntent,
): AuthCredentials {
  const email = input.email.trim();
  const errors = getAuthInputErrors(input, intent);
  const firstError = errors.email ?? errors.password;
  if (firstError) throw new Error(firstError);

  return { email, password: input.password };
}
