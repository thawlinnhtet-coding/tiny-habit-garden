"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { CalendarDays, Flower2, Leaf, Plus, Sun } from "lucide-react";
import { PixelSprite } from "./pixel-sprite";
import { useGarden } from "./garden-provider";

export function GardenShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { error, habits, mode, signOut, loading } = useGarden();
  const [accountError, setAccountError] = useState("");
  const [signingOut, setSigningOut] = useState(false);
  async function leave() {
    setSigningOut(true);
    setAccountError("");
    try {
      await signOut();
    } catch (cause) {
      setAccountError(
        cause instanceof Error
          ? cause.message
          : "Sign out failed. Please try again.",
      );
    } finally {
      setSigningOut(false);
    }
  }
  return (
    <div className="app-frame">
      <header className="site-header">
        <Link href="/garden" className="brand">
          <PixelSprite name="oak-2" size={48} />
          <span>
            Tiny Habit
            <br />
            <strong>Garden</strong>
            <span className="brand-dot">.</span>
          </span>
        </Link>
        <nav aria-label="Main navigation" className="main-nav">
          <Link
            href="/garden"
            aria-current={pathname === "/garden" ? "page" : undefined}
          >
            <Flower2 size={17} /> My Garden
          </Link>
          <Link
            href="/today"
            aria-current={pathname === "/today" ? "page" : undefined}
          >
            <CalendarDays size={17} /> Today{" "}
            {habits.length > 0 && (
              <span className="nav-count">
                {habits.filter((habit) => !habit.completedToday).length}
              </span>
            )}
          </Link>
        </nav>
        <div className="account-menu">
          <Link href="/" className="guest-badge">
            <span className="status-dot" />
            {loading
              ? "Opening…"
              : mode === "private"
                ? "Private garden"
                : mode === "guest"
                  ? "Guest garden"
                  : "Account unavailable"}
          </Link>
          {mode === "private" && (
            <button
              onClick={leave}
              disabled={signingOut}
              className="signout-button"
            >
              {signingOut ? "Signing out…" : "Sign out"}
            </button>
          )}
        </div>
      </header>
      <main id="main-content" className="main-content">
        {error && (
          <div role="alert" className="error-banner">
            {error}
          </div>
        )}
        {accountError && (
          <div role="alert" className="error-banner">
            {accountError}
          </div>
        )}
        {children}
      </main>
      <footer className="site-footer">
        <span>
          <Leaf size={14} /> Small steps, beautiful things.
        </span>
        <span>
          Made for a slower kind of progress <Sun size={14} />
        </span>
      </footer>
    </div>
  );
}

export function NewHabitLink({
  children = "Plant a habit",
}: {
  children?: React.ReactNode;
}) {
  return (
    <Link href="/habits/new" className="pixel-button primary">
      <Plus size={17} />
      {children}
    </Link>
  );
}
