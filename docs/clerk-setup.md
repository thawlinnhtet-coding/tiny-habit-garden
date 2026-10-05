# Clerk setup

The user chose a Clerk development instance on the existing Vercel URL. This is a demo/testing setup, not a production Clerk instance. Clerk production requires an owned domain: [Vercel deployment guide](https://clerk.com/docs/guides/development/deployment/vercel).

## 1. Create the application

Open [Clerk Dashboard](https://dashboard.clerk.com), create **Tiny Habit Garden**, and select email/password, Google, and GitHub. Keep it in **Development**. In the sign-up settings, require email verification by code. Our custom pages handle input validation, verification-code entry, password recovery, and original provider icons through Clerk's custom-flow APIs. Do not enable required username, first/last name, phone, organization selection, or MFA enrollment tasks for this V1. Email device-trust codes and existing authenticator codes are supported; other factors/tasks display an explicit unsupported-setup message. Keep Clerk's signup bot protection enabled; the custom forms include its CAPTCHA mount.

Copy the development keys from **API keys** into the ignored `D:\tiny-habit-garden\.env.local`:

```dotenv
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_REPLACE_ME
CLERK_SECRET_KEY=sk_test_REPLACE_ME
```

Keep the secret out of chat and Git. Keep the existing public Supabase variables: the database still stores habits. Restart the local server after changing keys.

## 2. Connect the database

In Clerk, open **Integrations → Supabase** and activate the integration. Copy the Clerk instance domain. This adds `"role": "authenticated"` to session tokens.

In Supabase, open **Authentication → Third-party Auth**, add **Clerk**, and enter that same instance domain. Use the native integration; do not share the Supabase JWT secret or create the deprecated JWT template. [Supabase's instructions](https://supabase.com/docs/guides/auth/third-party/clerk).

Back up the database, then run `supabase/migrations/202610050001_clerk.sql` in Supabase's SQL Editor. An existing project already has the original garden migration; run only the new migration there. A fresh project needs both migrations in filename order.

The new migration preserves habits, completions, and timezones. Existing Supabase owners remain stored under their old IDs. Clerk accounts have different IDs; old accounts/passwords are not automatically imported. A verified owner mapping is required before an existing private garden can be opened through Clerk. Do not automatically link gardens by a user-entered email address. Guest gardens remain in browser storage.

For an existing garden, independently verify the original Supabase account and its new Clerk account belong to the same person. Back up the database and use `supabase/manual/transfer-garden-owner.sql` in SQL Editor, replacing its two explicit ID placeholders. It transfers ownership and preserves the original timezone/completion dates. It accepts an empty Clerk garden (including its automatically created profile) and refuses to merge a target that already has plants. This script is an administrator operation; the app does not expose account transfers. Old Supabase passwords are not imported: use Clerk signup/recovery or a separately planned official user import.

## 3. Vercel development demo

Add the same two Clerk development keys to the Vercel project's environment variables. The publishable key is public; mark the secret key sensitive. Keep the Supabase variables. Redeploy after saving. The app keeps `/login`, `/signup`, and uses `/auth/sso-callback` for unfinished social flows. Successful authentication redirects to `/garden`. Set the application sign-in/sign-up URLs to our routes, not the hosted Account Portal.

Google/GitHub development connections can use Clerk's shared credentials. Production will need an owned domain, production Clerk keys, and your own OAuth credentials; the previous Supabase callback URLs are not used by Clerk. [Environment guide](https://clerk.com/docs/guides/development/managing-environments).

## 4. Verify

Sign up with email, enter the verification code, sign out and in, then try Google and GitHub. Create one temporary habit, water it, reload, and confirm it remains. Use a second account to confirm its garden is separate, then remove the test habit. Test on desktop and mobile.

Changing authentication does not repair Supabase database connectivity. If Clerk sign-in succeeds but the private garden cannot load, check the native integration, migration, and database connection. The app preserves private mode and reports the error instead of substituting a guest garden.
