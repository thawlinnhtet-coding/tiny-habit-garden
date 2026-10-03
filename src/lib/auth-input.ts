export type AuthIntent = "sign-in" | "sign-up";

export type AuthCredentials = {
  email: string;
  password: string;
};

export function validateAuthInput(
  input: AuthCredentials,
  intent: AuthIntent,
): AuthCredentials {
  const email = input.email.trim();

  if (!email) throw new Error("Enter your email address.");
  if (email.length > 254)
    throw new Error("Your email address must be 254 characters or fewer.");
  if (!input.password) throw new Error("Enter your password.");
  if (intent === "sign-up" && input.password.length < 8)
    throw new Error("Choose a password with at least 8 characters.");

  return { email, password: input.password };
}
