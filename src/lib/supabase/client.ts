"use client";
import { createClient } from "@supabase/supabase-js";

export function clerkSupabase(getToken: () => Promise<string | null>) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key)
    throw new Error("Your account garden is not configured yet.");
  return createClient(url, key, {
    accessToken: async () => {
      const token = await getToken();
      if (!token)
        throw new Error("Your session expired. Please sign in again.");
      return token;
    },
  });
}
