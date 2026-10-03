# Supabase setup for Tiny Habit Garden

The app needs one Supabase project. Your local `.env.local` already contains values; keep this file private and out of Git.

## 1. Project and public configuration

Open https://supabase.com/dashboard and create or select your Tiny Habit Garden project. In the project's **Connect** dialog, copy the Project URL and publishable key into `D:\tiny-habit-garden\.env.local`:

```dotenv
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_YOUR_KEY
```

Only the public publishable key belongs here. The application does not need a service-role key or database password.

## 2. Database

Open **SQL Editor → New query**. Paste the entire file `supabase/migrations/202610030001_garden.sql` from this repository and click **Run**. Run it once on a fresh project. It creates private habits, timezone profiles, daily completion records, row-level security, and the server-time check-in functions.

The migration has passed local PostgreSQL operation tests. Applying it to your hosted project is still required.

## 3. Authentication URLs

Under **Authentication → URL Configuration**, set the local Site URL to `http://127.0.0.1:3000`. If you use `localhost` instead, use that host consistently. New sign-ups enter a code in the app and do not need an auth callback URL. You can keep `/auth/confirm` in Redirect URLs while older confirmation emails are still in circulation.

Under **Authentication → Email Templates → Confirm signup**, replace the confirmation link with a code the user can enter in the app:

```html
<h2>Your Tiny Habit Garden verification code</h2>
<p>Enter this code in the app to confirm your email address:</p>
<p style="font-size: 28px; font-weight: bold; letter-spacing: 6px">
  {{ .Token }}
</p>
<p>If you did not create this account, you can ignore this email.</p>
```

Keep email/password authentication and email confirmation enabled. New sign-ups will show a code-entry step with options to resend the code or change the email address. Supabase's default OTP expiry applies.

## 4. Start locally

Restart the development server after changing environment values. In a terminal:

```powershell
cd D:\tiny-habit-garden
npm run dev -- --hostname 127.0.0.1
```

Use Node 24 or a supported runtime. Open http://127.0.0.1:3000, create your account, and plant a habit in your private garden. Guest preview habits remain in their browser storage and are not imported automatically.

## 5. Check the setup

Sign in, create a habit, complete it, and reload. It should remain watered today. Sign out: the private garden must disappear. Sign into a second account: it should start with its own empty garden.

Live authentication, isolation, and simultaneous check-in validation remain pending until the migration is applied. Tell the agent when the database and confirmation settings are ready; don't send passwords or confirmation tokens in chat.

Sources: [Supabase Next.js quickstart](https://supabase.com/docs/guides/getting-started/quickstarts/nextjs), [SSR clients](https://supabase.com/docs/guides/auth/server-side/creating-a-client?framework=nextjs), [email templates](https://supabase.com/docs/guides/auth/auth-email-templates), [verify OTP](https://supabase.com/docs/reference/javascript/auth-verifyotp), [resend confirmation](https://supabase.com/docs/reference/javascript/auth-resend), and [redirect URLs](https://supabase.com/docs/guides/auth/redirect-urls).
