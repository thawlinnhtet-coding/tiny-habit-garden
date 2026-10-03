"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { useGarden } from "./garden-provider";
import { browserSupabase, supabaseConfigured } from "@/lib/supabase/client";

export function AuthPanel() {
  const garden = useGarden();
  const router = useRouter();
  const [signUp, setSignUp] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  useEffect(() => {
    if (new URLSearchParams(window.location.search).get("auth_error")) queueMicrotask(() => setError("This confirmation link couldn't be used. Sign up again to request a fresh email, or sign in if you already confirmed your account."));
  }, []);
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); setPending(true); setError(""); setMessage("");
    const fields = new FormData(event.currentTarget);
    const credentials = { email: String(fields.get("email")).trim(), password: String(fields.get("password")) };
    try {
      const client = browserSupabase();
      const result = signUp ? await client.auth.signUp({ ...credentials, options: { emailRedirectTo: `${window.location.origin}/auth/confirm` } }) : await client.auth.signInWithPassword(credentials);
      if (result.error) throw result.error;
      if (signUp && !result.data.session) setMessage("Check your inbox for a confirmation link. Then come back and sign in to grow your private garden.");
      else router.push("/garden");
    } catch (cause) { setError(cause instanceof Error ? cause.message : "We couldn't connect. Please try again."); }
    finally { setPending(false); }
  }
  if (garden.mode === "private") return <div className="auth-paper"><h2>Your garden is waiting.</h2><p>Signed in as {garden.email}.</p><Link href="/garden" className="pixel-button primary">Enter my garden</Link></div>;
  if (!supabaseConfigured) return <p className="field-note">Account gardens are being prepared. Try your little guest garden for now.</p>;
  return <form className="auth-paper" onSubmit={submit}><span className="eyebrow">YOUR OWN LITTLE WORLD</span><h2>{signUp ? "Make a home for your garden." : "Welcome back, gardener."}</h2><p>Your private garden follows you across visits.</p><div className="auth-fields"><div className="form-field"><Label htmlFor="auth-email">Email</Label><Input id="auth-email" name="email" type="email" autoComplete="email" required /></div><div className="form-field"><Label htmlFor="auth-password">Password</Label><Input id="auth-password" name="password" type="password" autoComplete={signUp ? "new-password" : "current-password"} minLength={signUp ? 8 : 1} required /></div></div>{error && <p role="alert" className="form-error">{error}</p>}{message && <p role="status" className="auth-message">{message}</p>}<div className="auth-actions"><Button className="pixel-button primary" type="submit" disabled={pending}>{pending ? "Opening the gate…" : signUp ? "Create account" : "Sign in"}</Button><Button type="button" variant="ghost" disabled={pending} onClick={() => { setSignUp(!signUp); setError(""); setMessage(""); }}>{signUp ? "I already have an account" : "Create an account"}</Button></div></form>;
}
