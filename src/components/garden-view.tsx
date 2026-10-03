"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ArrowUpRight, Flame, Leaf, Pencil, Trash2 } from "lucide-react";
import { plants, stageNames } from "@/lib/plants";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { GardenShell, NewHabitLink } from "./garden-shell";
import { GardenScene } from "./garden-scene";
import { PixelSprite } from "./pixel-sprite";
import { useGarden } from "./garden-provider";
import { CompleteHabitButton, GrowthMessage, WateringSprites } from "./watering";

export function GardenView() {
  const garden = useGarden();
  const router = useRouter();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  const selected = garden.habits.find((habit) => habit.id === selectedId);
  async function remove() {
    if (!selected) return;
    setPending(true); setError("");
    try { await garden.remove(selected.id); setSelectedId(null); setConfirmDelete(false); }
    catch (cause) { setError(cause instanceof Error ? cause.message : "We couldn't remove this habit."); }
    finally { setPending(false); }
  }
  return <GardenShell>
    <div className="page-heading"><div><span className="eyebrow"><Leaf size={13} /> YOUR OWN LITTLE CORNER</span><h1>A little care. A little growth.</h1><p>Your habits are taking root. There&apos;s no hurry here.</p></div><NewHabitLink /></div>
    {garden.loading ? <div className="garden-loading" role="status">Opening the garden gate…</div> : <GardenScene habits={garden.habits} celebration={garden.celebration} onSelect={(habit) => { setSelectedId(habit.id); setConfirmDelete(false); setError(""); }} onPlant={() => router.push("/habits/new")} />}
    <GrowthMessage />
    <div className="garden-below"><div className="garden-note"><PixelSprite name="wildflower-5" size={96} /><div><span className="eyebrow">GROW AT YOUR OWN PACE</span><h2>Progress has roots.</h2><p>A missed day may end a streak, but your plants keep all the care you&apos;ve given them.</p></div></div><Link href="/today" className="today-link"><span><span className="eyebrow">ONE SMALL STEP</span><strong>See your habits for today</strong></span><ArrowUpRight size={22} /></Link></div>
    <Dialog open={!!selected} onOpenChange={(open) => { if (!open) { setSelectedId(null); setConfirmDelete(false); } }}>
      <DialogContent className="plant-dialog">
        {selected && <><DialogHeader><span className="eyebrow">A LITTLE STORY OF GROWTH</span><span className="today-plant"><PixelSprite name={`${selected.plantType}-${garden.celebration?.id === selected.id && garden.celebration.phase === "watering" ? garden.celebration.fromStage : selected.stage}`} size={144} className={garden.celebration?.id === selected.id ? "water-bounce" : ""} />{garden.celebration?.id === selected.id && <WateringSprites celebration={garden.celebration} />}</span><DialogTitle>{selected.name}</DialogTitle><DialogDescription>{plants[selected.plantType].name} · {stageNames[selected.stage - 1]}</DialogDescription></DialogHeader><div className="plant-facts"><span><Flame size={18} />{selected.streak}-day streak</span><span><Leaf size={18} />{selected.totalCompletions} total completions</span></div><div className="growth-progress"><div role="progressbar" aria-label="Progress to next growth stage" aria-valuenow={selected.progress} aria-valuemin={0} aria-valuemax={100}><span style={{ width: `${selected.progress}%` }} /></div><p>{selected.nextStageIn ? `${selected.nextStageIn} more ${selected.nextStageIn === 1 ? "check-in" : "check-ins"} to the next stage` : "Fully grown. Every new day is still worth a little care."}</p></div>{!confirmDelete && <CompleteHabitButton habit={selected} />}{confirmDelete ? <div className="delete-confirm"><p>Remove this habit and its plant? This also removes its saved progress.</p><div className="form-actions"><Button variant="outline" onClick={() => setConfirmDelete(false)} disabled={pending}>Keep my plant</Button><Button className="pixel-button danger" onClick={remove} disabled={pending}>{pending ? "Removing…" : "Remove habit"}</Button></div></div> : <div className="dialog-actions"><Link className="pixel-button secondary" href={`/habits/${selected.id}/edit`}><Pencil size={16} />Edit habit</Link><Button variant="ghost" className="delete-button" onClick={() => setConfirmDelete(true)}><Trash2 size={16} />Remove</Button></div>}{error && <p role="alert" className="form-error">{error}</p>}</>}
      </DialogContent>
    </Dialog>
  </GardenShell>;
}

