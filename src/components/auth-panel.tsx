"use client";

import Link from "next/link";
import { useState } from "react";
import { useGarden } from "./garden-provider";
import { AuthForm } from "./auth-form";
import { ClerkAuthForm } from "./clerk-auth-form";
import type { AuthIntent } from "@/lib/auth-input";
export type { AuthIntent } from "@/lib/auth-input";

function UnconfiguredForm({
  intent,
  unavailable,
  busy = false,
}: {
  intent: AuthIntent;
  unavailable?: string;
  busy?: boolean;
}) {
  const [message, setMessage] = useState("");
  const [recovery, setRecovery] = useState(false);
  return (
    <AuthForm
      key={String(recovery)}
      intent={intent}
      step={recovery ? "recovery-email" : "credentials"}
      configured={false}
      busy={busy}
      availabilityNotice={unavailable}
      message={message}
      onSubmit={async () =>
        setMessage(
          unavailable ??
            "Account sign-in isn't available yet. Please use a guest garden for now.",
        )
      }
      onRecovery={() => {
        setMessage("");
        setRecovery(true);
      }}
      onRestart={async () => {
        setMessage("");
        setRecovery(false);
      }}
    />
  );
}

export function AuthPanel({
  intent,
  callback = false,
}: {
  intent: AuthIntent;
  callback?: boolean;
}) {
  const garden = useGarden();
  if (!garden.authConfigured) return <UnconfiguredForm intent={intent} />;
  if (garden.mode === "unavailable")
    return (
      <UnconfiguredForm
        intent={intent}
        unavailable={garden.error || "Connecting to your account…"}
        busy={!garden.error}
      />
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
  return <ClerkAuthForm intent={intent} callback={callback} />;
}
