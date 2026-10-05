"use client";

import { useClerk, useSignIn, useSignUp } from "@clerk/nextjs";
import type { SetActiveNavigate } from "@clerk/nextjs/types";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { AuthForm } from "./auth-form";
import type { AuthIntent, AuthStep, AuthValues } from "@/lib/auth-input";

class FlowError extends Error {}
async function checked(
  result: Promise<{ error: { longMessage?: string } | null }>,
) {
  const { error } = await result;
  if (error) throw error;
}

export function ClerkAuthForm({
  intent,
  callback = false,
}: {
  intent: AuthIntent;
  callback?: boolean;
}) {
  const clerk = useClerk();
  const { signIn, errors: signInErrors } = useSignIn();
  const { signUp, errors: signUpErrors } = useSignUp();
  const router = useRouter();
  const [signupFlow, setSignupFlow] = useState(intent === "sign-up");
  const [step, setStep] = useState<AuthStep>(() => {
    if (intent === "sign-up" && signUp.status === "missing_requirements") {
      if (signUp.missingFields.includes("email_address"))
        return "missing-email";
      if (signUp.unverifiedFields.includes("email_address"))
        return "signup-code";
    }
    if (signIn.status === "needs_new_password") return "new-password";
    if (
      ["needs_client_trust", "needs_second_factor"].includes(
        signIn.status ?? "",
      )
    )
      return signIn.supportedSecondFactors.some((f) => f.strategy === "totp")
        ? "totp"
        : "email-code";
    return "credentials";
  });
  const [email, setEmail] = useState(
    signUp.emailAddress ?? signIn.identifier ?? "",
  );
  const [busy, setBusy] = useState(callback);
  const [message, setMessage] = useState("");
  const [notice, setNotice] = useState("");
  const inFlight = useRef(false);
  const resumed = useRef(false);

  const navigate: SetActiveNavigate = async ({ session, decorateUrl }) => {
    if (session?.currentTask)
      throw new FlowError(
        "Your account needs an additional setup step. Please contact the app owner before continuing.",
      );
    const url = decorateUrl("/garden");
    if (url.startsWith("http")) window.location.assign(url);
    else router.replace(url);
  };

  async function advanceSignIn() {
    setSignupFlow(false);
    if (signIn.status === "complete")
      return checked(signIn.finalize({ navigate }));
    if (signIn.status === "needs_new_password") {
      setStep("new-password");
      return;
    }
    if (
      ["needs_client_trust", "needs_second_factor"].includes(
        signIn.status ?? "",
      )
    ) {
      if (signIn.supportedSecondFactors.some((f) => f.strategy === "totp")) {
        setStep("totp");
        return;
      }
      if (
        signIn.supportedSecondFactors.some((f) => f.strategy === "email_code")
      ) {
        setStep("email-code");
        await checked(signIn.mfa.sendEmailCode());
        return;
      }
      throw new FlowError(
        "This account uses a verification method this garden doesn't support yet. Please contact the app owner.",
      );
    }
    if (signIn.status === "needs_first_factor") {
      setStep("credentials");
      return;
    }
    throw new FlowError(
      "Sign-in couldn't finish. Please try again or sign in with email.",
    );
  }

  async function advanceSignUp() {
    setSignupFlow(true);
    setEmail(signUp.emailAddress ?? "");
    if (signUp.status === "complete")
      return checked(signUp.finalize({ navigate }));
    if (
      signUp.missingFields.includes("email_address") &&
      signUp.missingFields.every((f) => f === "email_address")
    ) {
      setStep("missing-email");
      return;
    }
    if (signUp.missingFields.length)
      throw new FlowError(
        "Account setup requires extra profile fields. Please contact the app owner to finish signing up.",
      );
    if (signUp.unverifiedFields.includes("email_address")) {
      setStep("signup-code");
      await checked(signUp.verifications.sendEmailCode());
      return;
    }
    throw new FlowError(
      "Sign-up couldn't finish. Please try again or sign up with email.",
    );
  }

  async function run(action: () => Promise<void>): Promise<boolean> {
    if (inFlight.current) return false;
    inFlight.current = true;
    setBusy(true);
    setMessage("");
    setNotice("");
    try {
      await action();
      return true;
    } catch (error) {
      const friendly =
        error instanceof FlowError
          ? error.message
          : error &&
              typeof error === "object" &&
              "longMessage" in error &&
              typeof error.longMessage === "string"
            ? error.longMessage
            : "We couldn't finish that step. Please check your connection and try again.";
      setMessage(friendly);
      return false;
    } finally {
      inFlight.current = false;
      setBusy(false);
    }
  }

  useEffect(() => {
    if (!callback || !clerk.loaded || resumed.current) return;
    resumed.current = true;
    void run(async () => {
      if (signIn.status === "complete") return advanceSignIn();
      if (signUp.isTransferable) {
        await checked(signIn.create({ transfer: true }));
        return advanceSignIn();
      }
      if (signIn.isTransferable) {
        await checked(signUp.create({ transfer: true }));
        return advanceSignUp();
      }
      if (
        signUp.status === "complete" ||
        signUp.status === "missing_requirements"
      )
        return advanceSignUp();
      const existing = signIn.existingSession ?? signUp.existingSession;
      if (existing) {
        await clerk.setActive({ session: existing.sessionId, navigate });
        return;
      }
      if (
        [
          "needs_second_factor",
          "needs_client_trust",
          "needs_new_password",
          "needs_first_factor",
        ].includes(signIn.status ?? "")
      )
        return advanceSignIn();
      throw new FlowError(
        "Social sign-in wasn't completed. Please try again or use email.",
      );
    });
    // The redirect result is consumed once. Later updates belong to form actions.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [callback, clerk.loaded]);

  async function submit(values: AuthValues) {
    await run(async () => {
      switch (step) {
        case "credentials":
          setEmail(values.email);
          setSignupFlow(intent === "sign-up");
          if (intent === "sign-up") {
            await checked(
              signUp.password({
                emailAddress: values.email,
                password: values.password,
              }),
            );
            await advanceSignUp();
          } else {
            await checked(
              signIn.password({
                emailAddress: values.email,
                password: values.password,
              }),
            );
            await advanceSignIn();
          }
          break;
        case "signup-code":
          await checked(
            signUp.verifications.verifyEmailCode({ code: values.code }),
          );
          await advanceSignUp();
          break;
        case "missing-email":
          await checked(signUp.update({ emailAddress: values.email }));
          await advanceSignUp();
          break;
        case "email-code":
          await checked(signIn.mfa.verifyEmailCode({ code: values.code }));
          await advanceSignIn();
          break;
        case "totp":
          await checked(signIn.mfa.verifyTOTP({ code: values.code }));
          await advanceSignIn();
          break;
        case "recovery-email":
          setEmail(values.email);
          setSignupFlow(false);
          await checked(signIn.create({ identifier: values.email }));
          await checked(signIn.resetPasswordEmailCode.sendCode());
          setStep("recovery-code");
          break;
        case "recovery-code":
          await checked(
            signIn.resetPasswordEmailCode.verifyCode({ code: values.code }),
          );
          await advanceSignIn();
          break;
        case "new-password":
          await checked(
            signIn.resetPasswordEmailCode.submitPassword({
              password: values.password,
              signOutOfOtherSessions: true,
            }),
          );
          await advanceSignIn();
          break;
      }
    });
  }

  const fields = signupFlow ? signUpErrors.fields : signInErrors.fields;
  const emailError = signupFlow
    ? signUpErrors.fields.emailAddress
    : signInErrors.fields.identifier;
  const displayError = (
    error: { message: string; longMessage?: string } | null,
  ) => error?.longMessage ?? error?.message;
  const resend = ["signup-code", "email-code", "recovery-code"].includes(step)
    ? async () => {
        const success = await run(async () => {
          if (step === "signup-code")
            await checked(signUp.verifications.sendEmailCode());
          else if (step === "email-code")
            await checked(signIn.mfa.sendEmailCode());
          else await checked(signIn.resetPasswordEmailCode.sendCode());
        });
        if (success) setNotice("A fresh code is on its way. Check your inbox.");
        return success;
      }
    : undefined;
  return (
    <>
      {notice && (
        <p role="status" className="auth-code-notice">
          {notice}
        </p>
      )}
      <AuthForm
        key={step}
        intent={signupFlow ? "sign-up" : "sign-in"}
        step={step}
        email={email}
        busy={busy}
        configured
        message={message}
        errors={{
          email: displayError(emailError),
          password: displayError(fields.password),
          code: displayError(fields.code),
        }}
        onSubmit={submit}
        onSocial={async (provider) => {
          await run(async () =>
            checked(
              (intent === "sign-up" ? signUp : signIn).sso({
                strategy:
                  provider === "google" ? "oauth_google" : "oauth_github",
                redirectCallbackUrl: "/auth/sso-callback",
                redirectUrl: "/garden",
              }),
            ),
          );
        }}
        onRecovery={() => {
          setMessage("");
          setSignupFlow(false);
          setStep("recovery-email");
        }}
        onRestart={async () => {
          await run(async () => {
            await checked(signIn.reset());
            await checked(signUp.reset());
            setStep("credentials");
            setSignupFlow(intent === "sign-up");
          });
        }}
        onResend={resend}
      />
    </>
  );
}
