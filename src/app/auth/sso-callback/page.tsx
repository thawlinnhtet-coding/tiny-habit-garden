import { AccountPage } from "@/components/account-page";

export const metadata = { title: "Opening your garden | Tiny Habit Garden" };

export default function SocialCallbackPage() {
  return <AccountPage intent="sign-in" callback />;
}
