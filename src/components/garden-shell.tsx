"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CalendarDays, Flower2, Leaf, Plus, Sun } from "lucide-react";
import { PixelSprite } from "./pixel-sprite";
import { useGarden } from "./garden-provider";

export function GardenShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { error, habits } = useGarden();
  return <div className="app-frame">
    <header className="site-header">
      <Link href="/garden" className="brand"><PixelSprite name="oak-2" size={48} /><span>Tiny Habit<br /><strong>Garden</strong><span className="brand-dot">.</span></span></Link>
      <nav aria-label="Main navigation" className="main-nav">
        <Link href="/garden" aria-current={pathname === "/garden" ? "page" : undefined}><Flower2 size={17} /> My Garden</Link>
        <Link href="/today" aria-current={pathname === "/today" ? "page" : undefined}><CalendarDays size={17} /> Today {habits.length > 0 && <span className="nav-count">{habits.filter((habit) => !habit.completedToday).length}</span>}</Link>
      </nav>
      <Link href="/" className="guest-badge"><span className="status-dot" /> Guest garden</Link>
    </header>
    <main id="main-content" className="main-content">
      {error && <div role="alert" className="error-banner">{error}</div>}
      {children}
    </main>
    <footer className="site-footer"><span><Leaf size={14} /> Small steps, beautiful things.</span><span>Made for a slower kind of progress <Sun size={14} /></span></footer>
  </div>;
}

export function NewHabitLink({ children = "Plant a habit" }: { children?: React.ReactNode }) {
  return <Link href="/habits/new" className="pixel-button primary"><Plus size={17} />{children}</Link>;
}
