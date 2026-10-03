"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Menu } from "@base-ui/react/menu";
import {
  CalendarDays,
  ChevronDown,
  Flower2,
  Home,
  Leaf,
  LogOut,
  Plus,
  Sun,
  UserRound,
} from "lucide-react";
import { PixelSprite } from "./pixel-sprite";
import { useGarden } from "./garden-provider";

export function GardenShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { error, habits, mode, email, signOut, loading } = useGarden();
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
          <Menu.Root>
            <Menu.Trigger
              className="account-trigger"
              aria-label="Account menu"
              disabled={loading || signingOut}
            >
              <span className="account-avatar">
                <UserRound size={17} />
              </span>
              <span>
                {loading
                  ? "Opening…"
                  : signingOut
                    ? "Signing out…"
                    : mode === "guest"
                      ? "Guest"
                      : "Account"}
              </span>
              <ChevronDown size={14} className="account-chevron" />
            </Menu.Trigger>
            <Menu.Portal>
              <Menu.Positioner
                align="end"
                sideOffset={8}
                className="account-positioner"
              >
                <Menu.Popup className="account-popup" aria-label="Account">
                  <div className="account-summary">
                    <strong>
                      {mode === "private"
                        ? "Your account"
                        : mode === "guest"
                          ? "Guest garden"
                          : "Account unavailable"}
                    </strong>
                    {mode === "private" && email && (
                      <span className="account-email">{email}</span>
                    )}
                    <p>
                      {mode === "private"
                        ? "Your garden is saved to your account."
                        : mode === "guest"
                          ? "Your garden is saved in this browser."
                          : "Check your connection and reload."}
                    </p>
                  </div>
                  {mode === "guest" && (
                    <>
                      <Menu.LinkItem
                        render={<Link href="/login" />}
                        closeOnClick
                        className="account-menu-item"
                      >
                        <UserRound size={16} /> Sign in
                      </Menu.LinkItem>
                      <Menu.LinkItem
                        render={<Link href="/signup" />}
                        closeOnClick
                        className="account-menu-item"
                      >
                        <Leaf size={16} /> Create an account
                      </Menu.LinkItem>
                    </>
                  )}
                  <Menu.LinkItem
                    render={<Link href="/" />}
                    closeOnClick
                    className="account-menu-item"
                  >
                    <Home size={16} /> Back to home
                  </Menu.LinkItem>
                  {mode === "private" && (
                    <Menu.Item
                      onClick={leave}
                      disabled={signingOut}
                      className="account-menu-item"
                    >
                      <LogOut size={16} /> Sign out
                    </Menu.Item>
                  )}
                </Menu.Popup>
              </Menu.Positioner>
            </Menu.Portal>
          </Menu.Root>
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
