"use client";
import { createClient } from "@supabase/supabase-js";

export function clerkSupabase(
  getToken: () => Promise<string | null>,
  ownerId: string,
) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key)
    throw new Error("Your account garden is not configured yet.");
  return createClient(url, key, {
    accessToken: async () => {
      const token = await getToken();
      if (!token)
        throw new Error("Your session expired. Please sign in again.");
      // Bind the request to this garden. Supabase verifies the token signature.
      let subject: unknown;
      try {
        const payload = token
          .split(".")[1]
          .replace(/-/g, "+")
          .replace(/_/g, "/");
        subject = JSON.parse(atob(payload)).sub;
      } catch {
        throw new Error("We couldn't read your session. Please sign in again.");
      }
      if (subject !== ownerId)
        throw new Error(
          "Your account changed. Open the current garden before continuing.",
        );
      return token;
    },
  });
}
