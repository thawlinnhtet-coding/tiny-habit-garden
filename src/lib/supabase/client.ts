"use client";
import { createBrowserClient } from "@supabase/ssr";

export const supabaseConfigured = Boolean(
  process.env.NEXT_PUBLIC_SUPABASE_URL &&
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
);

export function browserSupabase() {
  if (!supabaseConfigured)
    throw new Error(
      "Account gardens are not configured yet. You can still try the guest garden.",
    );
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
  );
}
