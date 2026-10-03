import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const auth = vi.hoisted(() => ({
  exchangeCodeForSession: vi.fn(),
  verifyOtp: vi.fn(),
}));

vi.mock("@supabase/ssr", () => ({
  createServerClient: () => ({ auth }),
}));

import { NextRequest } from "next/server";
import { GET } from "../app/auth/confirm/route";

const originalUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const originalKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

describe("email confirmation callback", () => {
  beforeEach(() => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = "https://garden.example.supabase.co";
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY = "sb_publishable_test";
    auth.exchangeCodeForSession.mockResolvedValue({ error: null });
    auth.verifyOtp.mockResolvedValue({ error: null });
  });

  afterEach(() => {
    if (originalUrl === undefined) delete process.env.NEXT_PUBLIC_SUPABASE_URL;
    else process.env.NEXT_PUBLIC_SUPABASE_URL = originalUrl;
    if (originalKey === undefined)
      delete process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
    else process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY = originalKey;
  });

  it("exchanges the PKCE code from the default signup email", async () => {
    const response = await GET(
      new NextRequest("https://garden.example/auth/confirm?code=email-code"),
    );

    expect(auth.exchangeCodeForSession).toHaveBeenCalledWith("email-code");
    expect(response.headers.get("location")).toBe(
      "https://garden.example/garden",
    );
    expect(response.headers.get("cache-control")).toBe("private, no-store");
  });

  it("continues to accept older token-hash confirmation links", async () => {
    const response = await GET(
      new NextRequest(
        "https://garden.example/auth/confirm?token_hash=old-token&type=email",
      ),
    );

    expect(auth.verifyOtp).toHaveBeenCalledWith({
      token_hash: "old-token",
      type: "email",
    });
    expect(response.headers.get("location")).toBe(
      "https://garden.example/garden",
    );
  });

  it("sends expired or invalid links back to sign-in", async () => {
    auth.exchangeCodeForSession.mockResolvedValueOnce({
      error: new Error("expired"),
    });
    const response = await GET(
      new NextRequest("https://garden.example/auth/confirm?code=expired"),
    );

    expect(response.headers.get("location")).toBe(
      "https://garden.example/login?auth_error=confirmation",
    );
  });
});
