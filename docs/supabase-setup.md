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

Once the migration is ready, open **SQL Editor → New query**. Paste the entire file `supabase/migrations/202610030001_garden.sql` from this repository and click **Run**. Run it once on a fresh project. It creates private habits, timezone profiles, daily completion records, row-level security, and the server-time check-in functions.

The migration is still being implemented; wait for the finished file before this step.

## 3. Authentication URLs

Under **Authentication → URL Configuration**, set the local Site URL to `http://127.0.0.1:3000`. Add `http://127.0.0.1:3000/auth/confirm` to Redirect URLs. If you use `localhost` instead, add that host's equivalent URL and use it consistently.

Under **Authentication → Email Templates → Confirm signup**, use this confirmation link:

```html
<a href="{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=email">Confirm your garden account</a>
```

Keep email/password authentication enabled. With email confirmation enabled, sign up using an email address you can access and follow the confirmation email before signing in.

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

Sources: [Supabase Next.js quickstart](https://supabase.com/docs/guides/getting-started/quickstarts/nextjs), [SSR clients](https://supabase.com/docs/guides/auth/server-side/creating-a-client?framework=nextjs), [email templates](https://supabase.com/docs/guides/auth/auth-email-templates), and [redirect URLs](https://supabase.com/docs/guides/auth/redirect-urls).
