import type { Metadata } from "next";
import { AccountPage } from "@/components/account-page";

export const metadata: Metadata = { title: "Sign in · Tiny Habit Garden" };

export default function LoginPage() {
  return <AccountPage intent="sign-in" />;
}
