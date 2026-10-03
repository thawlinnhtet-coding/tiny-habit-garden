import type { Metadata } from "next";
import { AccountPage } from "@/components/account-page";

export const metadata: Metadata = {
  title: "Create an account · Tiny Habit Garden",
};

export default function SignupPage() {
  return <AccountPage intent="sign-up" />;
}
