"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { MotionConfig, useReducedMotion } from "motion/react";
import { createGuestGarden, type CompletionResult, type GardenHabit, type GardenOperations, type HabitInput } from "@/lib/garden";

export type GardenCelebration = { id: string; fromStage: number; grew: boolean; streak: number; phase: "watering" | "grown" };

type GardenContextValue = {
  habits: GardenHabit[];
  loading: boolean;
  error: string;
  create: (input: HabitInput) => Promise<void>;
  edit: (id: string, input: HabitInput) => Promise<void>;
  remove: (id: string) => Promise<void>;
  refresh: () => Promise<void>;
  complete: (id: string) => Promise<CompletionResult>;
  celebration: GardenCelebration | null;
};
const GardenContext = createContext<GardenContextValue | null>(null);

export function GardenProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<{ habits: GardenHabit[]; operations: GardenOperations | null; loading: boolean; error: string }>({ habits: [], operations: null, loading: true, error: "" });
  const [celebration, setCelebration] = useState<GardenCelebration | null>(null);
  const reducedMotion = useReducedMotion();
  useEffect(() => {
    let active = true;
    Promise.resolve().then(async () => {
      try {
        const operations = createGuestGarden(window.localStorage);
        const habits = await operations.read();
        if (active) setState({ habits, operations, loading: false, error: "" });
      } catch {
        if (active) setState({ habits: [], operations: null, loading: false, error: "We couldn't open your saved garden. Your saved data hasn't been changed. Check browser storage permissions and reload." });
      }
    });
    return () => { active = false; };
  }, []);
  const refresh = useCallback(async () => {
    if (!state.operations) return;
    const habits = await state.operations.read();
    setState((previous) => ({ ...previous, habits, error: "" }));
  }, [state.operations]);
  useEffect(() => {
    if (!state.operations) return;
    const update = () => { refresh().catch(() => setState((previous) => ({ ...previous, error: "We couldn't refresh your garden. Your saved progress is safe; try reloading." }))); };
    const interval = window.setInterval(update, 60000);
    window.addEventListener("focus", update);
    window.addEventListener("storage", update);
    return () => { window.clearInterval(interval); window.removeEventListener("focus", update); window.removeEventListener("storage", update); };
  }, [state.operations, refresh]);
  useEffect(() => {
    if (!celebration) return;
    if (celebration.phase === "watering") {
      const timer = window.setTimeout(() => setCelebration((previous) => previous ? { ...previous, phase: "grown" } : null), 850);
      return () => window.clearTimeout(timer);
    }
    const timer = window.setTimeout(() => setCelebration(null), 2000);
    return () => window.clearTimeout(timer);
  }, [celebration]);
  async function mutate(action: (operations: GardenOperations) => Promise<unknown>) {
    if (!state.operations) throw new Error("Your garden is still opening. Please try again in a moment.");
    await action(state.operations);
    await refresh();
  }
  async function complete(id: string) {
    if (!state.operations) throw new Error("Your garden is still opening.");
    const before = state.habits.find((habit) => habit.id === id);
    const result = await state.operations.complete(id);
    await refresh();
    if (result.completed) setCelebration({ id, fromStage: before?.stage ?? result.habit.stage, grew: result.grew, streak: result.habit.streak, phase: reducedMotion ? "grown" : "watering" });
    return result;
  }
  return <MotionConfig reducedMotion="user"><GardenContext.Provider value={{ habits: state.habits, loading: state.loading, error: state.error, refresh, create: (input) => mutate((operations) => operations.create(input)), edit: (id, input) => mutate((operations) => operations.edit(id, input)), remove: (id) => mutate((operations) => operations.remove(id)), complete, celebration }}>{children}</GardenContext.Provider></MotionConfig>;
}

export function useGarden() {
  const context = useContext(GardenContext);
  if (!context) throw new Error("GardenProvider is required.");
  return context;
}
