"use client";

import Link from "next/link";
import { SignIn, SignUp } from "@clerk/nextjs";
import { useGarden } from "./garden-provider";
import { useLighting } from "./lighting-provider";

export type AuthIntent = "sign-up" | "sign-in";

export function AuthPanel({ intent }: { intent: AuthIntent }) {
  const garden = useGarden();
  const { lighting } = useLighting();
  if (!garden.authConfigured)
    return (
      <div className="auth-paper">
        <h2>Account gardens are being prepared.</h2>
        <p>Try your little guest garden for now.</p>
      </div>
    );
  if (garden.mode === "unavailable")
    return (
      <p role={garden.error ? "alert" : "status"}>
        {garden.error || "Opening the garden gate…"}
      </p>
    );
  if (garden.mode === "private")
    return (
      <div className="auth-paper">
        <h2>Your garden is waiting.</h2>
        <p>Signed in{garden.email ? ` as ${garden.email}` : ""}.</p>
        <Link href="/garden" className="pixel-button primary">
          Enter my garden
        </Link>
      </div>
    );
  const night = lighting === "night";
  const appearance = {
    variables: {
      colorPrimary: night ? "#acc88c" : "#52734b",
      colorBackground: night ? "#203741" : "#fffdf5",
      colorForeground: night ? "#ecedcc" : "#304c3e",
      colorMutedForeground: night ? "#bdc6af" : "#72816a",
      colorInput: night ? "#172d35" : "#fffdf5",
      colorInputForeground: night ? "#ecedcc" : "#304c3e",
      colorDanger: night ? "#ffb6a4" : "#a33d31",
      fontFamily: "Arial, sans-serif",
      fontSize: "1rem",
      borderRadius: "4px",
    },
    layout: { socialButtonsVariant: "blockButton" as const },
    elements: {
      rootBox: "garden-auth-root",
      cardBox: "garden-auth-card-box",
      card: "garden-auth-card",
      headerTitle: "garden-auth-title",
      formButtonPrimary: "garden-auth-submit",
      formFieldInput: "garden-auth-input",
      socialButtonsBlockButton: "garden-auth-social-button",
      socialButtonsProviderIcon: "garden-auth-provider-icon",
    },
  };
  return (
    <div className="clerk-account" aria-label="Account authentication">
      {intent === "sign-up" ? (
        <SignUp
          routing="hash"
          signInUrl="/login"
          forceRedirectUrl="/garden"
          appearance={appearance}
        />
      ) : (
        <SignIn
          routing="hash"
          signUpUrl="/signup"
          forceRedirectUrl="/garden"
          appearance={appearance}
        />
      )}
    </div>
  );
}
