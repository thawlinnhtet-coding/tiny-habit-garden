"use client";

import { motion } from "motion/react";
import { Moon, Plus, Sun } from "lucide-react";
import type { GardenHabit } from "@/lib/garden";
import { plants, stageNames } from "@/lib/plants";
import { PixelSprite } from "./pixel-sprite";

import { AnimatedPlant } from "./watering";
import { useLighting } from "./lighting-provider";

const stars = [
  [8, 22],
  [18, 58],
  [29, 12],
  [39, 40],
  [48, 13],
  [56, 65],
  [65, 30],
  [80, 60],
  [89, 20],
  [95, 64],
];
const fireflies = [
  [8, 25],
  [20, 58],
  [37, 15],
  [55, 68],
  [74, 28],
  [90, 54],
];

export function GardenScene({
  habits,
  onSelect,
  onPlant,
  compact = false,
}: {
  habits: GardenHabit[];
  onSelect?: (habit: GardenHabit) => void;
  onPlant?: () => void;
  compact?: boolean;
}) {
  const { lighting } = useLighting();
  const night = lighting === "night";
  const slots = Math.max(8, Math.ceil((habits.length + 1) / 4) * 4);
  return (
    <section
      className={`garden-scene ${compact ? "compact-scene" : ""}`}
      aria-label="Your pixel garden"
    >
      <div className="scene-topline">
        <span>
          <span className="status-dot" /> YOUR LITTLE PATCH
        </span>
        <span>
          {night ? (
            <Moon size={14} aria-hidden="true" />
          ) : (
            <Sun size={14} aria-hidden="true" />
          )}{" "}
          {night ? "A peaceful night to grow" : "A lovely day to grow"}
        </span>
      </div>
      <div className="scene-sky" aria-hidden="true">
        <PixelSprite name="cloud" size={144} className="cloud cloud-one" />
        <PixelSprite name="cloud" size={96} className="cloud cloud-two" />
        <PixelSprite name="cloud" size={144} className="cloud cloud-three" />
        <span className="pixel-sun" />
        <div className="night-sky">
          {stars.map(([left, top], index) => (
            <span
              key={index}
              className="night-star"
              style={{
                left: `${left}%`,
                top: `${top}%`,
                animationDelay: `${index * -0.7}s`,
              }}
            >
              <PixelSprite name="star" size={48} />
            </span>
          ))}
          <PixelSprite name="moon" size={96} className="pixel-moon" />
          <span className="shooting-star">
            <PixelSprite name="star" size={48} />
          </span>
        </div>
      </div>
      <div className="garden-ground">
        <div className="background-grass" aria-hidden="true" />
        <PixelSprite name="oak-5" size={192} className="decor-tree tree-left" />
        <PixelSprite
          name="oak-5"
          size={144}
          className="decor-tree tree-right"
        />
        <PixelSprite
          name="sparkle"
          size={48}
          className="ambient-sparkle sparkle-one"
        />
        <PixelSprite
          name="sparkle"
          size={48}
          className="ambient-sparkle sparkle-two"
        />
        <PixelSprite name="rock" size={96} className="decor-rock" />
        <PixelSprite name="butterfly" size={48} className="ambient-butterfly" />
        <div className="night-fireflies" aria-hidden="true">
          {fireflies.map(([left, top], index) => (
            <span
              key={index}
              className="firefly"
              style={{
                left: `${left}%`,
                top: `${top}%`,
                animationDelay: `${index * -2.5}s`,
              }}
            >
              <PixelSprite name="firefly" size={48} />
            </span>
          ))}
        </div>
        <div className="garden-beds">
          {Array.from({ length: slots }, (_, index) => {
            const habit = habits[index];
            return habit ? (
              <motion.button
                key={habit.id}
                layout
                initial={{ scale: 0.6, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                type="button"
                className={`garden-plot planted-plot`}
                onClick={() => onSelect?.(habit)}
                aria-label={`${habit.name}, ${plants[habit.plantType].name}, ${stageNames[habit.stage - 1]}`}
              >
                <AnimatedPlant habit={habit} />
                <span className="plant-name-tag">{habit.name}</span>
              </motion.button>
            ) : (
              <button
                key={`empty-${index}`}
                className="garden-plot empty-plot"
                type="button"
                onClick={onPlant}
                aria-label="Plant a new habit"
              >
                <span className="empty-plot-marker">
                  <Plus size={18} />
                </span>
              </button>
            );
          })}
        </div>
        <div className="grass-front" aria-hidden="true" />
        <div className="garden-fence" aria-hidden="true" />
      </div>
      <div className="scene-caption">
        <span>
          {habits.length
            ? "Every plant has a little story. Tap one to see yours."
            : "An empty patch. A fresh beginning. Your first seed belongs here."}
        </span>
        <span>
          {habits.length} {habits.length === 1 ? "plant" : "plants"}
        </span>
      </div>
    </section>
  );
}
