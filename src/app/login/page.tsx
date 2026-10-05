import type { Metadata } from "next";
import { AccountPage } from "@/components/account-page";

export const metadata: Metadata = { title: "Sign in · Tiny Habit Garden" };

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { auth_error: authError } = await searchParams;

  return (
    <AccountPage
      intent="sign-in"
      notice={
        authError === "social_cancelled"
          ? "Sign-in was canceled. You can retry with Google or GitHub, or use email instead."
          : undefined
      }
    />
  );
}
