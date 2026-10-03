"use client";

import { useState } from "react";
import { Check, Droplets, Flame } from "lucide-react";
import type { GardenHabit } from "@/lib/garden";
import { stageNames } from "@/lib/plants";
import { Button } from "@/components/ui/button";
import { PixelSprite } from "./pixel-sprite";
import { useGarden, type GardenCelebration } from "./garden-provider";

export function CompleteHabitButton({ habit }: { habit: GardenHabit }) {
  const { complete } = useGarden();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  async function water() {
    setPending(true); setError("");
    try { await complete(habit.id); }
    catch (cause) { setError(cause instanceof Error ? cause.message : "Your check-in couldn't be saved. Please try again."); }
    finally { setPending(false); }
  }
  return <div className="water-button-wrap"><Button className={`pixel-button ${habit.completedToday ? "secondary" : "primary"}`} disabled={pending || habit.completedToday} onClick={water} aria-label={habit.completedToday ? `Completed ${habit.name} today` : `Complete ${habit.name}`}>{habit.completedToday ? <Check size={16} /> : <Droplets size={16} />}{pending ? "Saving…" : habit.completedToday ? "Watered today" : "Complete"}</Button>{error && <p role="alert" className="form-error">{error}</p>}</div>;
}

export function WateringSprites({ celebration }: { celebration: GardenCelebration }) {
  return <span className={`watering-sprites phase-${celebration.phase}`} aria-hidden="true"><PixelSprite name="watering-can" size={96} className="watering-can" />{[0,1,2,3].map((index) => <PixelSprite key={index} name="drop" size={48} className={`water-drop drop-${index}`} />)}{[0,1,2,3].map((index) => <span key={index} className={`pixel-particle particle-${index}`} />)}</span>;
}

export function GrowthMessage() {
  const { celebration, habits } = useGarden();
  if (!celebration) return null;
  const habit = habits.find((item) => item.id === celebration.id);
  return <div role="status" aria-live="polite" className="growth-message"><PixelSprite name="watering-can" size={48} /><span><strong><Flame size={16} />{celebration.streak} Day Streak!</strong><span>{celebration.grew && habit ? `Your ${stageNames[habit.stage - 1].toLowerCase()} is growing. Lovely work.` : "A little real-life care. A happier little garden."}</span></span></div>;
}
