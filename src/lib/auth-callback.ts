import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function finishEmailConfirmation(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");
  const tokenHash = request.nextUrl.searchParams.get("token_hash");
  const type = request.nextUrl.searchParams.get("type");
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  const response = NextResponse.redirect(new URL("/garden", request.url));
  response.headers.set("Cache-Control", "private, no-store");
  const emailToken = tokenHash && type === "email";
  if (
    !request.nextUrl.searchParams.has("error") &&
    url &&
    key &&
    (code || emailToken)
  ) {
    try {
      const supabase = createServerClient(url, key, {
        cookies: {
          getAll: () => request.cookies.getAll(),
          setAll(cookies, headers) {
            cookies.forEach(({ name, value, options }) =>
              response.cookies.set(name, value, options),
            );
            Object.entries(headers).forEach(([name, value]) =>
              response.headers.set(name, value),
            );
          },
        },
      });
      const { error } = code
        ? await supabase.auth.exchangeCodeForSession(code)
        : await supabase.auth.verifyOtp({
            token_hash: tokenHash!,
            type: "email",
          });
      if (!error) return response;
    } catch {
      // A failed exchange returns a retryable message rather than a server error.
    }
  }
  response.headers.set(
    "Location",
    new URL("/login?auth_error=confirmation", request.url).toString(),
  );
  return response;
}
