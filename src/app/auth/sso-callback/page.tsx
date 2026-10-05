import { AccountPage } from "@/components/account-page";
import { redirect } from "next/navigation";

export const metadata = { title: "Opening your garden | Tiny Habit Garden" };

type CallbackSearchParams = Record<string, string | string[] | undefined>;

export default async function SocialCallbackPage({
  searchParams,
}: {
  searchParams: Promise<CallbackSearchParams>;
}) {
  const params = await searchParams;
  const hasProviderError = [
    params.error,
    params.error_description,
    params.error_code,
  ].some((value) =>
    Array.isArray(value) ? value.some(Boolean) : Boolean(value),
  );

  if (hasProviderError) redirect("/login?auth_error=social_cancelled");

  return <AccountPage intent="sign-in" callback />;
}
