# Enable Google and GitHub sign-in

The application handles sign-in through Supabase. Provider credentials belong in the Supabase dashboard; the application's public environment variables stay the same. The existing Vercel address can host the app; this flow does not require purchasing a domain.

## 1. Supabase redirects

In Authentication → URL Configuration, keep Site URL set to `https://tiny-habit-garden.vercel.app`. Add these Redirect URLs:

- `https://tiny-habit-garden.vercel.app/auth/callback`
- `http://127.0.0.1:3000/auth/callback` for local development

Keep the existing `/auth/confirm` redirects for email confirmation. If you develop on `localhost` or another port, add its exact callback URL too.

There are two different callbacks: the provider sends users to **Supabase's** `https://<project-ref>.supabase.co/auth/v1/callback`; Supabase then sends them to **the app's** `/auth/callback`. Copy the provider callback from Authentication → Sign In / Providers in Supabase rather than guessing it.

## 2. Google

1. Open [Google Auth Platform](https://console.cloud.google.com/auth/overview) and select or create a project.
2. Configure Branding and Audience for Tiny Habit Garden. If the app is in Testing, add the Google accounts that will test it; public availability depends on the audience/publishing configuration.
3. Under Clients, create an OAuth client with application type **Web application**.
4. Add `https://tiny-habit-garden.vercel.app` and your local development origin to Authorized JavaScript origins.
5. Add the **Supabase provider callback URL** to Authorized redirect URIs.
6. In Supabase Authentication → Sign In / Providers → Google, enable Google, paste the client ID and client secret, and save.

Use the minimum sign-in scopes. The app does not ask for Google Drive, Gmail, or offline access. See [Supabase's Google guide](https://supabase.com/docs/guides/auth/social-login/auth-google).

## 3. GitHub

1. Open [GitHub OAuth applications](https://github.com/settings/developers) and create a new OAuth App.
2. Name it Tiny Habit Garden and use `https://tiny-habit-garden.vercel.app` as Homepage URL.
3. Set Authorization callback URL to the **Supabase provider callback URL**. Leave Device Flow off.
4. Generate a client secret. In Supabase Authentication → Sign In / Providers → GitHub, enable GitHub, paste its client ID and client secret, and save.

The app uses sign-in identity only and does not request repository access. See [Supabase's GitHub guide](https://supabase.com/docs/guides/auth/social-login/auth-github).

## 4. Check the live flow

After deployment, open `/login`, choose a provider, and complete its sign-in/consent yourself. You should return to `/garden` with Account in the header. Create a disposable habit, reload to check persistence, then remove it and sign out. Repeat with the other provider. Test cancellation as well: it should return to a useful sign-in message.

Keep client secrets, passwords, authorization codes, and callback tokens out of chat and GitHub issues. Let the agent know which providers are enabled so real sign-in can be distinguished from mocked checks.
