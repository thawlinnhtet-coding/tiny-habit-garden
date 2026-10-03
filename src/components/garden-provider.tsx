"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { MotionConfig } from "motion/react";
import { createGuestGarden, type GardenHabit, type GardenOperations, type HabitInput } from "@/lib/garden";

type GardenContextValue = {
  habits: GardenHabit[];
  loading: boolean;
  error: string;
  create: (input: HabitInput) => Promise<void>;
  edit: (id: string, input: HabitInput) => Promise<void>;
  remove: (id: string) => Promise<void>;
  refresh: () => Promise<void>;
};
const GardenContext = createContext<GardenContextValue | null>(null);

export function GardenProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<{ habits: GardenHabit[]; operations: GardenOperations | null; loading: boolean; error: string }>({ habits: [], operations: null, loading: true, error: "" });
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
  async function mutate(action: (operations: GardenOperations) => Promise<unknown>) {
    if (!state.operations) throw new Error("Your garden is still opening. Please try again in a moment.");
    await action(state.operations);
    await refresh();
  }
  return <MotionConfig reducedMotion="user"><GardenContext.Provider value={{ habits: state.habits, loading: state.loading, error: state.error, refresh, create: (input) => mutate((operations) => operations.create(input)), edit: (id, input) => mutate((operations) => operations.edit(id, input)), remove: (id) => mutate((operations) => operations.remove(id)) }}>{children}</GardenContext.Provider></MotionConfig>;
}

export function useGarden() {
  const context = useContext(GardenContext);
  if (!context) throw new Error("GardenProvider is required.");
  return context;
}
