"use client";
import Link from "next/link";
import { Leaf } from "lucide-react";
import { plants } from "@/lib/plants";
import { GardenShell, NewHabitLink } from "./garden-shell";
import { useGarden } from "./garden-provider";
import { PixelSprite } from "./pixel-sprite";
import { CompleteHabitButton, GrowthMessage, AnimatedPlant } from "./watering";

export function TodayView() {
  const { habits, loading } = useGarden();
  return (
    <GardenShell>
      <div className="today-paper">
        <div className="page-heading">
          <div>
            <span className="eyebrow">
              <Leaf size={13} /> ONE DAY AT A TIME
            </span>
            <h1>A little care for today.</h1>
            <p>
              {habits.length
                ? `${habits.filter((habit) => !habit.completedToday).length} of ${habits.length} little intentions still need a little care.`
                : "Your next small step can start right here."}
            </p>
          </div>
          <NewHabitLink />
        </div>
        {loading ? (
          <p role="status">Opening your garden…</p>
        ) : habits.length ? (
          <div className="habit-list">
            {habits.map((habit) => (
              <article key={habit.id} className="habit-row">
                <Link
                  href="/garden"
                  aria-label={`See ${habit.name} in the garden`}
                >
                  <AnimatedPlant habit={habit} />
                </Link>
                <div className="habit-row-copy">
                  <h2>{habit.name}</h2>
                  <p>
                    {plants[habit.plantType].name} · {habit.streak}-day streak
                  </p>
                </div>
                <CompleteHabitButton habit={habit} />
              </article>
            ))}
          </div>
        ) : (
          <div className="empty-today">
            <PixelSprite name="oak-2" size={96} />
            <h2>A fresh little beginning.</h2>
            <p>Plant a habit and give your day something lovely to grow.</p>
            <NewHabitLink>Plant my first habit</NewHabitLink>
          </div>
        )}
      </div>
      <GrowthMessage />
    </GardenShell>
  );
}
