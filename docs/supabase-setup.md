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

Under **Authentication → URL Configuration**, set the local Site URL to `http://127.0.0.1:3000`. Add `http://127.0.0.1:3000/auth/confirm` to Redirect URLs. If you use `localhost` instead, add that host's equivalent URL and use it consistently.

The default **Authentication → Email Templates → Confirm signup** email already uses a confirmation link. Newer free-tier projects using Supabase's default SMTP may show “Set up custom SMTP to edit templates”; this is expected, and the default link works with the app. The app also accepts PKCE callback links and older token-hash links.

To remove email confirmation, open **Authentication → Sign In / Providers → Email** and turn off **Confirm email**. Save the change. Sign-ups will then create a session immediately and the app will open the garden without sending a confirmation email. This also means Supabase does not check that a user owns the email address; users should enter an address they control so password recovery can reach them.

If you leave **Confirm email** on, sign up using an email address you can access and follow the default confirmation link before signing in. Supabase's built-in email service is for testing: it only delivers to project team addresses and is currently limited to two emails per hour. Sending to the public requires custom SMTP. OTP entry also requires customizable email templates, available with custom SMTP or an eligible plan.

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

Sources: [Supabase Next.js quickstart](https://supabase.com/docs/guides/getting-started/quickstarts/nextjs), [SSR clients](https://supabase.com/docs/guides/auth/server-side/creating-a-client?framework=nextjs), [email templates](https://supabase.com/docs/guides/auth/auth-email-templates), [custom SMTP](https://supabase.com/docs/guides/auth/auth-smtp), and [redirect URLs](https://supabase.com/docs/guides/auth/redirect-urls).
