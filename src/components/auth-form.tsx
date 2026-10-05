"use client";

import Link from "next/link";
import Image from "next/image";
import { Eye, EyeOff, ArrowRight, Mail, Sprout } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import {
  getAuthInputErrors,
  type AuthInputErrors,
  type AuthIntent,
  type AuthStep,
  type AuthValues,
} from "@/lib/auth-input";

export type AuthFormProps = {
  intent: AuthIntent;
  step?: AuthStep;
  email?: string;
  busy?: boolean;
  configured: boolean;
  availabilityNotice?: string;
  message?: string;
  errors?: AuthInputErrors;
  onSubmit: (values: AuthValues) => Promise<void>;
  onSocial?: (provider: "google" | "github") => Promise<void>;
  onRecovery?: () => void;
  onRestart?: () => Promise<void>;
  onResend?: () => Promise<boolean>;
};

const copy: Record<
  AuthStep,
  { title: string; description: string; action: string }
> = {
  credentials: { title: "", description: "", action: "" },
  "signup-code": {
    title: "Check your inbox.",
    description: "Enter the code we sent to your email to open your garden.",
    action: "Verify & grow my garden",
  },
  "email-code": {
    title: "One little security check.",
    description: "Enter the email code to finish signing in on this device.",
    action: "Verify & enter my garden",
  },
  totp: {
    title: "Your authenticator code.",
    description: "Enter the current code from your authenticator app.",
    action: "Verify & enter my garden",
  },
  "recovery-email": {
    title: "Find your way back.",
    description: "We'll send a code to help you choose a new password.",
    action: "Send reset code",
  },
  "recovery-code": {
    title: "Check your inbox.",
    description: "Enter your password reset code to continue.",
    action: "Verify reset code",
  },
  "new-password": {
    title: "A fresh start.",
    description: "Choose a new password for your garden.",
    action: "Save password & sign in",
  },
  "missing-email": {
    title: "One last little detail.",
    description:
      "Your provider didn't share an email. Add one to finish creating your account.",
    action: "Continue",
  },
};

export function AuthForm({
  intent,
  step = "credentials",
  email = "",
  busy = false,
  configured,
  availabilityNotice,
  message,
  errors: serverErrors = {},
  onSubmit,
  onSocial,
  onRecovery,
  onRestart,
  onResend,
}: AuthFormProps) {
  const signUp = intent === "sign-up";
  const [values, setValues] = useState<AuthValues>({
    email,
    password: "",
    code: "",
  });
  const [touched, setTouched] = useState<
    Partial<Record<keyof AuthValues, boolean>>
  >({});
  const [showPassword, setShowPassword] = useState(false);
  const [cooldown, setCooldown] = useState(onResend ? 30 : 0);
  const [submitted, setSubmitted] = useState<AuthValues | null>(null);
  const form = useRef<HTMLFormElement>(null);
  const cooldownActive = cooldown > 0;
  useEffect(() => {
    if (!cooldownActive) return;
    const timer = window.setInterval(
      () => setCooldown((n) => Math.max(0, n - 1)),
      1000,
    );
    return () => window.clearInterval(timer);
  }, [cooldownActive]);
  useEffect(() => {
    if (serverErrors.email || serverErrors.password || serverErrors.code)
      form.current
        ?.querySelector<HTMLInputElement>('[aria-invalid="true"]')
        ?.focus();
  }, [serverErrors]);
  const localErrors = getAuthInputErrors(values, intent, step);
  const visibleError = (field: keyof AuthValues) =>
    (touched[field] ? localErrors[field] : undefined) ??
    (submitted?.[field] === values[field] ? serverErrors[field] : undefined);
  const fields: (keyof AuthValues)[] =
    step === "credentials"
      ? ["email", "password"]
      : step === "new-password"
        ? ["password"]
        : ["recovery-email", "missing-email"].includes(step)
          ? ["email"]
          : ["code"];
  const details =
    step === "credentials"
      ? {
          title: signUp ? "Plant your first seed." : "Come on in.",
          description: signUp
            ? "A few little details, a world of possibility."
            : "Sign in to care for your little world.",
          action: signUp ? "Create my account" : "Sign in",
        }
      : copy[step];

  return (
    <div className="auth-paper manual-auth">
      <div className="auth-motif" aria-hidden="true">
        <Image
          src="/sprites/oak-2.png"
          alt=""
          width={48}
          height={48}
          unoptimized
          loading="eager"
        />
      </div>
      <h2>{details.title}</h2>
      <p className="auth-intro">{details.description}</p>
      {step === "credentials" && (
        <>
          <div className="auth-social">
            {(["google", "github"] as const).map((provider) => (
              <button
                key={provider}
                type="button"
                className={`auth-provider ${provider}`}
                disabled={busy || !configured}
                onClick={() => void onSocial?.(provider)}
              >
                <Image
                  src={`/brands/${provider}.${provider === "google" ? "png" : "svg"}`}
                  alt=""
                  width={20}
                  height={20}
                  unoptimized
                  loading="eager"
                />
                Continue with {provider === "google" ? "Google" : "GitHub"}
              </button>
            ))}
          </div>
          <div className="auth-divider">
            <span>or with email</span>
          </div>
        </>
      )}
      {step !== "credentials" && email && (
        <p className="auth-email">
          <Mail size={16} aria-hidden="true" />
          {email}
        </p>
      )}
      <form
        ref={form}
        noValidate
        aria-label={signUp ? "Create an account" : "Sign in to your account"}
        onSubmit={async (event) => {
          event.preventDefault();
          if (busy) return;
          setTouched(Object.fromEntries(fields.map((field) => [field, true])));
          const firstInvalid = fields.find((field) => localErrors[field]);
          if (firstInvalid) {
            form.current
              ?.querySelector<HTMLInputElement>(`[name="${firstInvalid}"]`)
              ?.focus();
            return;
          }
          setSubmitted({ ...values });
          await onSubmit({
            ...values,
            email: values.email.trim(),
            code: values.code.trim(),
          });
        }}
      >
        <div className="auth-fields">
          {fields.map((field) => {
            const error = visibleError(field);
            const id = `auth-${field}`;
            return (
              <div className="form-field" key={field}>
                <label htmlFor={id}>
                  {field === "email"
                    ? "Email"
                    : field === "password"
                      ? step === "new-password"
                        ? "New password"
                        : "Password"
                      : "Verification code"}
                </label>
                <div className="auth-input-wrap">
                  <input
                    id={id}
                    name={field}
                    value={values[field]}
                    required
                    disabled={busy}
                    type={
                      field === "password"
                        ? showPassword
                          ? "text"
                          : "password"
                        : field === "email"
                          ? "email"
                          : "text"
                    }
                    autoComplete={
                      field === "password"
                        ? signUp || step === "new-password"
                          ? "new-password"
                          : "current-password"
                        : field === "email"
                          ? "email"
                          : "one-time-code"
                    }
                    inputMode={
                      field === "code"
                        ? "numeric"
                        : field === "email"
                          ? "email"
                          : undefined
                    }
                    maxLength={
                      field === "code" ? 6 : field === "email" ? 254 : undefined
                    }
                    placeholder={
                      field === "email"
                        ? "you@example.com"
                        : field === "code"
                          ? "000000"
                          : undefined
                    }
                    aria-invalid={Boolean(error)}
                    aria-describedby={
                      error
                        ? `${id}-error`
                        : field === "password" &&
                            (signUp || step === "new-password")
                          ? "password-hint"
                          : undefined
                    }
                    onBlur={() =>
                      setTouched((old) => ({ ...old, [field]: true }))
                    }
                    onChange={(event) =>
                      setValues((old) => ({
                        ...old,
                        [field]: event.target.value,
                      }))
                    }
                  />
                  {field === "password" && (
                    <button
                      type="button"
                      className="auth-password-eye"
                      disabled={busy}
                      aria-label={
                        showPassword ? "Hide password" : "Show password"
                      }
                      aria-pressed={showPassword}
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  )}
                </div>
                {field === "password" &&
                  (signUp || step === "new-password") && (
                    <small id="password-hint">
                      At least 8 characters. A few words work nicely.
                    </small>
                  )}
                {error && (
                  <p
                    className="auth-field-error"
                    id={`${id}-error`}
                    role="alert"
                  >
                    {error}
                  </p>
                )}
              </div>
            );
          })}
        </div>
        {step === "credentials" && !signUp && (
          <button
            type="button"
            className="auth-text-button auth-forgot"
            disabled={busy}
            onClick={onRecovery}
          >
            Forgot password?
          </button>
        )}
        {message && (
          <p className="form-error" role="alert">
            {message}
          </p>
        )}
        <button
          className="pixel-button primary auth-submit"
          disabled={busy}
          type="submit"
        >
          {busy ? "Opening the garden gate…" : details.action}
          {!busy && <ArrowRight size={17} aria-hidden="true" />}
        </button>
      </form>
      {onResend && (
        <button
          type="button"
          className="auth-text-button auth-resend"
          disabled={busy || cooldown > 0}
          onClick={async () => {
            if (await onResend()) setCooldown(30);
          }}
        >
          {cooldown > 0 ? `Resend code in ${cooldown}s` : "Send a new code"}
        </button>
      )}
      {step !== "credentials" && onRestart && (
        <button
          className="auth-text-button auth-restart"
          type="button"
          disabled={busy}
          onClick={() => void onRestart()}
        >
          Back to {signUp ? "sign up" : "sign in"}
        </button>
      )}
      {step === "credentials" && (
        <div className="auth-switch">
          {signUp ? "Already have a little garden? " : "New to the garden? "}
          <Link href={signUp ? "/login" : "/signup"}>
            {signUp ? "Sign in" : "Create an account"}
          </Link>
        </div>
      )}
      {!configured && (
        <div className="auth-configuration" role="status">
          <Sprout size={16} aria-hidden="true" />
          <span>
            {availabilityNotice ??
              "Account gardens are being prepared. You can explore a guest garden for now."}
          </span>
        </div>
      )}
      <div id="clerk-captcha" />
    </div>
  );
}
