import type { Metadata } from "next";
import { GardenProvider } from "@/components/garden-provider";
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
    <html lang="en">
      <body>
        <a href="#main-content" className="skip-link">
          Skip to content
        </a>
        <GardenProvider>{children}</GardenProvider>
      </body>
    </html>
  );
}
