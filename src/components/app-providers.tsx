"use client";

import { ClerkProvider, useClerk, useSession } from "@clerk/nextjs";
import { useCallback, useEffect, useState } from "react";
import { GardenProvider } from "./garden-provider";
import { LightingProvider } from "./lighting-provider";

function ClerkGarden({ children }: { children: React.ReactNode }) {
  const { isLoaded, session } = useSession();
  const userId = session?.user.id ?? null;
  const getToken = useCallback(
    async () => session?.getToken() ?? null,
    [session],
  );
  const clerk = useClerk();
  const ready = isLoaded;
  const [timedOut, setTimedOut] = useState(false);
  useEffect(() => {
    if (ready) return;
    const timer = window.setTimeout(() => setTimedOut(true), 15000);
    return () => window.clearTimeout(timer);
  }, [ready]);
  const signOut = useCallback(async () => {
    await clerk.signOut({ redirectUrl: "/garden" });
  }, [clerk]);
  return (
    <GardenProvider
      key={!isLoaded ? "loading" : (userId ?? "guest")}
      account={{
        configured: true,
        ready,
        userId: userId ?? null,
        email: session?.user.primaryEmailAddress?.emailAddress ?? null,
        error:
          !ready && timedOut
            ? "We couldn't connect to your account. Check your connection and reload. Your private garden has not been replaced."
            : "",
        getToken,
        signOut,
      }}
    >
      {children}
    </GardenProvider>
  );
}

export function AppProviders({
  children,
  clerkEnabled,
}: {
  children: React.ReactNode;
  clerkEnabled: boolean;
}) {
  const garden = clerkEnabled ? (
    <ClerkProvider
      signInUrl="/login"
      signUpUrl="/signup"
      signInForceRedirectUrl="/garden"
      signUpForceRedirectUrl="/garden"
      afterSignOutUrl="/garden"
    >
      <ClerkGarden>{children}</ClerkGarden>
    </ClerkProvider>
  ) : (
    <GardenProvider>{children}</GardenProvider>
  );
  return <LightingProvider>{garden}</LightingProvider>;
}
