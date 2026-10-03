"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ArrowLeft, Check, Sprout } from "lucide-react";
import { plantTypes, type PlantType, type GardenHabit } from "@/lib/garden";
import { plants } from "@/lib/plants";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { GardenShell } from "./garden-shell";
import { PixelSprite } from "./pixel-sprite";
import { useGarden } from "./garden-provider";

function EditorForm({ habit }: { habit?: GardenHabit }) {
  const [name, setName] = useState(habit?.name ?? "");
  const [plantType, setPlantType] = useState<PlantType>(
    habit?.plantType ?? "oak",
  );
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  const garden = useGarden();
  const router = useRouter();
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError("");
    try {
      if (habit) await garden.edit(habit.id, { name, plantType });
      else await garden.create({ name, plantType });
      router.push("/garden");
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : "Your habit couldn't be saved. Please try again.",
      );
    } finally {
      setPending(false);
    }
  }
  return (
    <form onSubmit={submit} className="editor-paper">
      <div className="paper-heading">
        <span className="eyebrow">A LITTLE INTENTION</span>
        <PixelSprite name={`${plantType}-${habit?.stage ?? 1}`} size={96} />
        <h1>{habit ? "Tend to your habit." : "Good things start small."}</h1>
        <p>
          {habit
            ? "Make a little room for a change in your routine."
            : "Choose something kind to do for yourself. We'll give it a place to grow."}
        </p>
      </div>
      <div className="form-field">
        <Label htmlFor="habit-name">What&apos;s your tiny habit?</Label>
        <Input
          id="habit-name"
          autoFocus
          name="name"
          placeholder="e.g. Read 10 pages"
          maxLength={80}
          required
          value={name}
          onChange={(event) => setName(event.target.value)}
        />
        <span className="field-note">
          Small and specific is a lovely place to start.
        </span>
      </div>
      <fieldset className="plant-picker">
        <legend>Choose your plant</legend>
        <div className="plant-options">
          {plantTypes.map((type) => (
            <label
              key={type}
              className={`plant-choice ${plantType === type ? "selected" : ""}`}
            >
              <input
                type="radio"
                name="plantType"
                value={type}
                checked={plantType === type}
                onChange={() => setPlantType(type)}
              />
              <PixelSprite name={`${type}-5`} size={96} />
              <strong>{plants[type].name}</strong>
              {plantType === type && (
                <Check size={15} className="choice-check" />
              )}
            </label>
          ))}
        </div>
        <p className="field-note">{plants[plantType].description}</p>
      </fieldset>
      {error && (
        <p role="alert" className="form-error">
          {error}
        </p>
      )}
      <div className="form-actions">
        <Link href="/garden" className="text-link">
          Back to the garden
        </Link>
        <Button
          type="submit"
          className="pixel-button primary"
          disabled={pending || garden.loading || !!garden.error}
        >
          <Sprout size={17} />
          {pending ? "Saving…" : habit ? "Save changes" : "Plant my habit"}
        </Button>
      </div>
      <p className="guest-note">
        {garden.mode === "private"
          ? "Private garden · Saved to your account."
          : "Guest garden · Saved in this browser."}
      </p>
    </form>
  );
}

export function HabitEditor({ id }: { id?: string }) {
  const { habits, loading } = useGarden();
  const habit = id ? habits.find((item) => item.id === id) : undefined;
  return (
    <GardenShell>
      <div className="editor-wrap">
        <Link href="/garden" className="back-link">
          <ArrowLeft size={16} /> My Garden
        </Link>
        {loading ? (
          <p role="status">Opening your garden…</p>
        ) : id && !habit ? (
          <div className="editor-paper">
            <h1>This plant isn&apos;t here.</h1>
            <p>The habit may have been removed.</p>
            <Link href="/garden" className="text-link">
              Return to your garden
            </Link>
          </div>
        ) : (
          <EditorForm key={id ?? "new"} habit={habit} />
        )}
      </div>
    </GardenShell>
  );
}
