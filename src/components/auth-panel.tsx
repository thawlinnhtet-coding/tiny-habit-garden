"use client";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { useGarden } from "./garden-provider";
import { browserSupabase, supabaseConfigured } from "@/lib/supabase/client";
import {
  getAuthInputErrors,
  validateAuthInput,
  type AuthInputErrors,
  type AuthIntent,
} from "@/lib/auth-input";

export function AuthPanel({ intent }: { intent: AuthIntent }) {
  const garden = useGarden();
  const router = useRouter();
  const signUp = intent === "sign-up";
  const emailInput = useRef<HTMLInputElement>(null);
  const passwordInput = useRef<HTMLInputElement>(null);
  const otpInput = useRef<HTMLInputElement>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fieldErrors, setFieldErrors] = useState<AuthInputErrors>({});
  const [touched, setTouched] = useState({ email: false, password: false });
  const [pending, setPending] = useState(false);
  const [verificationEmail, setVerificationEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [otpError, setOtpError] = useState("");
  const [resending, setResending] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  function readFieldErrors(
    nextEmail = email,
    nextPassword = password,
  ): AuthInputErrors {
    const errors = getAuthInputErrors(
      { email: nextEmail, password: nextPassword },
      intent,
    );
    if (!errors.email && emailInput.current?.validity.typeMismatch)
      errors.email = "Enter a valid email address.";
    return errors;
  }
  function blurField(field: "email" | "password") {
    setTouched((current) => ({ ...current, [field]: true }));
    setFieldErrors((current) => ({
      ...current,
      [field]: readFieldErrors()[field],
    }));
  }
  useEffect(() => {
    if (new URLSearchParams(window.location.search).get("auth_error"))
      queueMicrotask(() =>
        setError(
          "That link expired. Go back to sign up for a fresh code, or sign in if your email is already confirmed.",
        ),
      );
  }, []);
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setMessage("");
    setTouched({ email: true, password: true });
    const validationErrors = readFieldErrors();
    setFieldErrors(validationErrors);
    if (validationErrors.email || validationErrors.password) {
      if (validationErrors.email) emailInput.current?.focus();
      else passwordInput.current?.focus();
      return;
    }
    setPending(true);
    try {
      const credentials = validateAuthInput({ email, password }, intent);
      const client = browserSupabase();
      const result = signUp
        ? await client.auth.signUp(credentials)
        : await client.auth.signInWithPassword(credentials);
      if (result.error) throw result.error;
      if (signUp && !result.data.session) {
        setVerificationEmail(credentials.email);
        setMessage(
          "A 6-digit code is on its way. Enter it below to confirm your email and open your private garden.",
        );
      } else router.push("/garden");
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : "We couldn't connect. Please try again.",
      );
    } finally {
      setPending(false);
    }
  }
  async function verifyCode(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setMessage("");
    if (!/^\d{6}$/.test(otp)) {
      setOtpError("Enter the 6-digit code from your email.");
      otpInput.current?.focus();
      return;
    }
    setOtpError("");
    setPending(true);
    try {
      const { error: verificationError } =
        await browserSupabase().auth.verifyOtp({
          email: verificationEmail,
          token: otp,
          type: "email",
        });
      if (verificationError) throw verificationError;
      router.push("/garden");
    } catch {
      setError(
        "That code didn't work. Check the digits or request a new code.",
      );
    } finally {
      setPending(false);
    }
  }
  async function resendCode() {
    setError("");
    setMessage("");
    setPending(true);
    setResending(true);
    try {
      const { error: resendError } = await browserSupabase().auth.resend({
        type: "signup",
        email: verificationEmail,
      });
      if (resendError) throw resendError;
      setOtp("");
      setOtpError("");
      setMessage("A fresh code is on its way to your inbox.");
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : "We couldn't send a new code. Please try again.",
      );
    } finally {
      setResending(false);
      setPending(false);
    }
  }
  if (garden.mode === "private")
    return (
      <div className="auth-paper">
        <h2>Your garden is waiting.</h2>
        <p>Signed in as {garden.email}.</p>
        <Link href="/garden" className="pixel-button primary">
          Enter my garden
        </Link>
      </div>
    );
  if (!supabaseConfigured)
    return (
      <p className="field-note">
        Account gardens are being prepared. Try your little guest garden for
        now.
      </p>
    );
  if (verificationEmail)
    return (
      <form className="auth-paper" onSubmit={verifyCode} noValidate>
        <span className="eyebrow">ONE LAST LITTLE STEP</span>
        <h2>Check your email</h2>
        <p>
          Enter the 6-digit verification code we sent to {verificationEmail}.
        </p>
        <div className="form-field">
          <Label htmlFor="auth-otp">Email verification code</Label>
          <Input
            ref={otpInput}
            id="auth-otp"
            name="otp"
            type="text"
            inputMode="numeric"
            autoComplete="one-time-code"
            pattern="[0-9]{6}"
            maxLength={6}
            value={otp}
            aria-invalid={Boolean(otpError)}
            aria-describedby={otpError ? "auth-otp-error" : undefined}
            required
            onChange={(event) => {
              setOtp(event.currentTarget.value.replace(/\D/g, "").slice(0, 6));
              setOtpError("");
              setError("");
            }}
          />
          {otpError && (
            <p id="auth-otp-error" role="alert" className="form-error">
              {otpError}
            </p>
          )}
        </div>
        {error && (
          <p role="alert" className="form-error">
            {error}
          </p>
        )}
        {message && (
          <p role="status" className="auth-message">
            {message}
          </p>
        )}
        <div className="auth-actions">
          <Button
            className="pixel-button primary"
            type="submit"
            disabled={pending}
          >
            {pending && !resending ? "Checking your code…" : "Verify email"}
          </Button>
        </div>
        <p className="auth-switch">
          <Button
            type="button"
            variant="link"
            className="auth-inline-button"
            disabled={pending}
            onClick={resendCode}
          >
            {resending ? "Sending code…" : "Resend code"}
          </Button>
          <span aria-hidden="true"> · </span>
          <Button
            type="button"
            variant="link"
            className="auth-inline-button"
            disabled={pending}
            onClick={() => {
              setVerificationEmail("");
              setOtp("");
              setOtpError("");
              setError("");
              setMessage("");
            }}
          >
            Change email
          </Button>
        </p>
      </form>
    );
  return (
    <form className="auth-paper" onSubmit={submit} noValidate>
      <span className="eyebrow">YOUR OWN LITTLE WORLD</span>
      <h2>{signUp ? "Create your account" : "Sign in to your garden"}</h2>
      <p>Your private garden follows you across visits.</p>
      <div className="auth-fields">
        <div className="form-field">
          <Label htmlFor="auth-email">Email</Label>
          <Input
            ref={emailInput}
            id="auth-email"
            name="email"
            type="email"
            autoComplete="email"
            autoCapitalize="none"
            spellCheck={false}
            maxLength={254}
            value={email}
            aria-invalid={Boolean(fieldErrors.email)}
            aria-describedby={
              fieldErrors.email ? "auth-email-error" : undefined
            }
            required
            onBlur={() => blurField("email")}
            onChange={(event) => {
              const nextEmail = event.currentTarget.value;
              setEmail(nextEmail);
              setError("");
              setMessage("");
              if (touched.email)
                setFieldErrors((current) => ({
                  ...current,
                  email: readFieldErrors(nextEmail).email,
                }));
            }}
          />
          {fieldErrors.email && (
            <p id="auth-email-error" role="alert" className="form-error">
              {fieldErrors.email}
            </p>
          )}
        </div>
        <div className="form-field">
          <Label htmlFor="auth-password">Password</Label>
          <Input
            ref={passwordInput}
            id="auth-password"
            name="password"
            type="password"
            autoComplete={signUp ? "new-password" : "current-password"}
            minLength={signUp ? 8 : 1}
            value={password}
            aria-invalid={Boolean(fieldErrors.password)}
            aria-describedby={
              fieldErrors.password ? "auth-password-error" : undefined
            }
            required
            onBlur={() => blurField("password")}
            onChange={(event) => {
              const nextPassword = event.currentTarget.value;
              setPassword(nextPassword);
              setError("");
              setMessage("");
              if (touched.password)
                setFieldErrors((current) => ({
                  ...current,
                  password: readFieldErrors(email, nextPassword).password,
                }));
            }}
          />
          {fieldErrors.password && (
            <p id="auth-password-error" role="alert" className="form-error">
              {fieldErrors.password}
            </p>
          )}
        </div>
      </div>
      {error && (
        <p role="alert" className="form-error">
          {error}
        </p>
      )}
      {message && (
        <p role="status" className="auth-message">
          {message}
        </p>
      )}
      <div className="auth-actions">
        <Button
          className="pixel-button primary"
          type="submit"
          disabled={pending}
        >
          {pending
            ? "Opening the gate…"
            : signUp
              ? "Create account"
              : "Sign in"}
        </Button>
      </div>
      <p className="auth-switch">
        {signUp ? "Already have an account?" : "New to the garden?"}{" "}
        <Link href={signUp ? "/login" : "/signup"}>
          {signUp ? "Sign in" : "Create an account"}
        </Link>
      </p>
    </form>
  );
}
