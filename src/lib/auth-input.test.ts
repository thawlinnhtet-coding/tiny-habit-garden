import { describe, expect, it } from "vitest";
import { validateAuthInput } from "./auth-input";

describe("auth input validation", () => {
  it("trims the email while preserving the password exactly", () => {
    expect(
      validateAuthInput(
        { email: "  gardener@example.com  ", password: " pass word " },
        "sign-in",
      ),
    ).toEqual({ email: "gardener@example.com", password: " pass word " });
  });

  it("rejects missing and overlong email addresses", () => {
    expect(() =>
      validateAuthInput({ email: "   ", password: "secret" }, "sign-in"),
    ).toThrow("email");
    expect(() =>
      validateAuthInput(
        { email: `${"a".repeat(243)}@example.com`, password: "secret" },
        "sign-in",
      ),
    ).toThrow("254");
  });

  it("requires a password and checks the eight-character sign-up minimum", () => {
    expect(() =>
      validateAuthInput({ email: "a@example.com", password: "" }, "sign-in"),
    ).toThrow("password");
    expect(() =>
      validateAuthInput(
        { email: "a@example.com", password: "1234567" },
        "sign-up",
      ),
    ).toThrow("8 characters");
    expect(
      validateAuthInput(
        { email: "a@example.com", password: "12345678" },
        "sign-up",
      ),
    ).toEqual({ email: "a@example.com", password: "12345678" });
  });

  it("allows short existing passwords during sign-in", () => {
    expect(
      validateAuthInput({ email: "a@example.com", password: "x" }, "sign-in"),
    ).toEqual({ email: "a@example.com", password: "x" });
  });
});
