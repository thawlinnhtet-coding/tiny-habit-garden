import type { Metadata } from "next";
import { GardenProvider } from "@/components/garden-provider";
import { LightingProvider } from "@/components/lighting-provider";
import { lightingBootstrap } from "@/lib/lighting";
import "./globals.css";

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
        <LightingProvider>
          <GardenProvider>{children}</GardenProvider>
        </LightingProvider>
      </body>
    </html>
  );
}
