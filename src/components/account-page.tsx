"use client";

import Link from "next/link";
import { ArrowLeft, Leaf } from "lucide-react";
import { AuthPanel, type AuthIntent } from "@/components/auth-panel";
import { GardenShell } from "@/components/garden-shell";
import { useGarden } from "@/components/garden-provider";

export function AccountPage({ intent }: { intent: AuthIntent }) {
  const signUp = intent === "sign-up";
  const { mode } = useGarden();

  return (
    <GardenShell>
      <section className="account-page" aria-labelledby="account-title">
        <Link href="/" className="back-link">
          <ArrowLeft size={16} /> Back to the garden
        </Link>
        <div className="account-page-heading">
          <span className="eyebrow">
            <Leaf size={13} /> YOUR OWN LITTLE WORLD
          </span>
          <h1 id="account-title">
            {signUp ? "A garden of your own." : "Welcome back, gardener."}
          </h1>
          <p>
            {signUp
              ? "Make a home for your habits, one small day at a time."
              : "Your little garden is ready when you are."}
          </p>
        </div>
        <AuthPanel intent={intent} />
        {mode === "guest" && (
          <Link href="/garden" className="guest-garden-link">
            Continue with a guest garden
          </Link>
        )}
      </section>
    </GardenShell>
  );
}
