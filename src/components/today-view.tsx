"use client";
import Link from "next/link";
import { Leaf } from "lucide-react";
import { plants } from "@/lib/plants";
import { GardenShell, NewHabitLink } from "./garden-shell";
import { useGarden } from "./garden-provider";
import { PixelSprite } from "./pixel-sprite";

export function TodayView() {
  const { habits, loading } = useGarden();
  return <GardenShell><div className="today-paper"><div className="page-heading"><div><span className="eyebrow"><Leaf size={13} /> ONE DAY AT A TIME</span><h1>A little care for today.</h1><p>{habits.length ? `${habits.length} little intentions, ready to take root.` : "Your next small step can start right here."}</p></div><NewHabitLink /></div>{loading ? <p role="status">Opening your garden…</p> : habits.length ? <div className="habit-list">{habits.map((habit) => <article key={habit.id} className="habit-row"><PixelSprite name={`${habit.plantType}-${habit.stage}`} size={96} /><div className="habit-row-copy"><h2>{habit.name}</h2><p>{plants[habit.plantType].name} · {habit.streak}-day streak</p></div><Link href="/garden" className="pixel-button secondary">See my plant</Link></article>)}</div> : <div className="empty-today"><PixelSprite name="oak-2" size={96} /><h2>A fresh little beginning.</h2><p>Plant a habit and give your day something lovely to grow.</p><NewHabitLink>Plant my first habit</NewHabitLink></div>}</div></GardenShell>;
}
