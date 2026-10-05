import type { Metadata } from "next";
import { AppProviders } from "@/components/app-providers";
import { lightingBootstrap } from "@/lib/lighting";
import "./globals.css";
import "./clerk.css";

export const metadata: Metadata = {
  title: "Tiny Habit Garden",
  description:
    "Small real-life habits. A little pixel garden that grows with you.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" data-garden-theme="day" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: lightingBootstrap }} />
      </head>
      <body>
        <a href="#main-content" className="skip-link">
          Skip to content
        </a>
        <AppProviders
          clerkEnabled={Boolean(
            process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY &&
            process.env.CLERK_SECRET_KEY,
          )}
        >
          {children}
        </AppProviders>
      </body>
    </html>
  );
}
