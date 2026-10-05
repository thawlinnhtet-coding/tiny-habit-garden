import { describe, expect, it } from "vitest";
import { getAuthInputErrors } from "./auth-input";

describe("account input rules", () => {
  it("reports both missing credentials and rejects malformed email addresses", () => {
    expect(
      getAuthInputErrors({ email: "", password: "", code: "" }, "sign-in"),
    ).toEqual({
      email: "Enter your email address.",
      password: "Enter your password.",
    });
    expect(
      getAuthInputErrors(
        { email: "gardener@", password: "existing", code: "" },
        "sign-in",
      ),
    ).toEqual({ email: "Enter a valid email address." });
  });
  it("requires eight characters for new passwords without rejecting existing short sign-in passwords", () => {
    const values = {
      email: " gardener@example.com ",
      password: "short",
      code: "",
    };
    expect(getAuthInputErrors(values, "sign-up")).toEqual({
      password: "Choose a password with at least 8 characters.",
    });
    expect(getAuthInputErrors(values, "sign-in")).toEqual({});
    expect(getAuthInputErrors(values, "sign-in", "new-password")).toEqual({
      password: "Choose a password with at least 8 characters.",
    });
  });
  it("accepts six digit email/authenticator codes and asks for correction before submission", () => {
    for (const step of [
      "signup-code",
      "email-code",
      "recovery-code",
      "totp",
    ] as const) {
      expect(
        getAuthInputErrors(
          { email: "", password: "", code: "12345a" },
          "sign-in",
          step,
        ),
      ).toEqual({ code: "Enter the 6-digit verification code." });
      expect(
        getAuthInputErrors(
          { email: "", password: "", code: " 012345 " },
          "sign-in",
          step,
        ),
      ).toEqual({});
    }
  });
});
