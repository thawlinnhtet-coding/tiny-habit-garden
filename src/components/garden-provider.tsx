"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { MotionConfig, useReducedMotion } from "motion/react";
import {
  createGuestGarden,
  type CompletionResult,
  type GardenHabit,
  type GardenOperations,
  type HabitInput,
} from "@/lib/garden";
import { createSupabaseGarden } from "@/lib/supabase-garden";
import { clerkSupabase } from "@/lib/supabase/client";

export type GardenCelebration = {
  id: string;
  fromStage: number;
  grew: boolean;
  streak: number;
  phase: "watering" | "grown";
};
type GardenState = {
  habits: GardenHabit[];
  operations: GardenOperations | null;
  loading: boolean;
  error: string;
  mode: "guest" | "private" | "unavailable";
  email: string | null;
};
type GardenContextValue = Omit<GardenState, "operations"> & {
  create: (input: HabitInput) => Promise<void>;
  edit: (id: string, input: HabitInput) => Promise<void>;
  remove: (id: string) => Promise<void>;
  refresh: () => Promise<void>;
  complete: (id: string) => Promise<CompletionResult>;
  signOut: () => Promise<void>;
  celebration: GardenCelebration | null;
  authConfigured: boolean;
};
const GardenContext = createContext<GardenContextValue | null>(null);

export type GardenAccount = {
  configured: boolean;
  ready: boolean;
  userId: string | null;
  email: string | null;
  getToken: () => Promise<string | null>;
  signOut: () => Promise<void>;
  error?: string;
};
const guestAccount: GardenAccount = {
  configured: false,
  ready: true,
  userId: null,
  email: null,
  getToken: async () => null,
  signOut: async () => {
    throw new Error("You are using a guest garden.");
  },
};
export function GardenProvider({
  children,
  account = guestAccount,
}: {
  children: React.ReactNode;
  account?: GardenAccount;
}) {
  const { ready, userId, email, getToken, error: accountError = "" } = account;

  const [state, setState] = useState<GardenState>({
    habits: [],
    operations: null,
    loading: true,
    error: "",
    mode: "unavailable",
    email: null,
  });
  const [celebration, setCelebration] = useState<GardenCelebration | null>(
    null,
  );
  const generation = useRef(0);
  const readSequence = useRef(0);
  const reducedMotion = useReducedMotion();
  useEffect(() => {
    let active = true;
    const version = ++generation.current;
    queueMicrotask(async () => {
      if (!active) return;
      setCelebration(null);
      const mode = ready ? (userId ? "private" : "guest") : "unavailable";
      setState({
        habits: [],
        operations: null,
        loading: !accountError,
        error: accountError,
        mode,
        email,
      });
      if (!ready) return;
      let operations: GardenOperations | null = null;
      try {
        if (userId) {
          const client = clerkSupabase(getToken, userId);
          operations = createSupabaseGarden(
            (parameters) => client.rpc("garden_operation", parameters),
            Intl.DateTimeFormat().resolvedOptions().timeZone,
          );
        } else operations = createGuestGarden(window.localStorage);
        const habits = await operations.read();
        if (active && generation.current === version)
          setState({
            habits,
            operations,
            loading: false,
            error: "",
            mode,
            email,
          });
      } catch (cause) {
        if (active && generation.current === version)
          setState({
            habits: [],
            operations,
            loading: false,
            mode,
            email,
            error: userId
              ? `${cause instanceof Error ? cause.message : "Your private garden couldn't be opened."} Please try again when your connection is ready.`
              : "We couldn't open your saved guest garden. Its data has been preserved. Check browser storage permissions and reload.",
          });
      }
    });
    return () => {
      active = false;
      generation.current = version + 1;
    };
  }, [ready, userId, email, getToken, accountError]);
  const refresh = useCallback(async () => {
    if (!state.operations) return;
    const version = generation.current;
    const sequence = ++readSequence.current;
    const habits = await state.operations.read();
    if (generation.current === version && readSequence.current === sequence)
      setState((previous) => ({ ...previous, habits, error: "" }));
  }, [state.operations]);
  useEffect(() => {
    if (!state.operations) return;
    const version = generation.current;
    const update = () => {
      refresh().catch(() => {
        if (generation.current === version)
          setState((previous) => ({
            ...previous,
            error:
              "We couldn't refresh your garden. Your saved progress is safe; try reloading.",
          }));
      });
    };
    const interval = window.setInterval(update, 60000);
    window.addEventListener("focus", update);
    window.addEventListener("storage", update);
    return () => {
      window.clearInterval(interval);
      window.removeEventListener("focus", update);
      window.removeEventListener("storage", update);
    };
  }, [state.operations, refresh]);
  useEffect(() => {
    if (!celebration) return;
    const timer = window.setTimeout(
      () =>
        setCelebration((previous) =>
          previous?.phase === "watering"
            ? { ...previous, phase: "grown" }
            : null,
        ),
      celebration.phase === "watering" ? 850 : 2000,
    );
    return () => window.clearTimeout(timer);
  }, [celebration]);
  async function mutate(
    action: (operations: GardenOperations) => Promise<unknown>,
  ) {
    if (!state.operations || state.loading)
      throw new Error("Your garden isn't ready. Please reload and try again.");
    const version = generation.current;
    await action(state.operations);
    if (version !== generation.current)
      throw new Error(
        "Your account changed. Open the current garden before continuing.",
      );
    await refresh();
  }
  async function complete(id: string) {
    if (!state.operations || state.loading)
      throw new Error("Your garden isn't ready. Please reload and try again.");
    const version = generation.current;
    const before = state.habits.find((habit) => habit.id === id);
    const result = await state.operations.complete(id);
    if (generation.current !== version)
      throw new Error(
        "Your account changed. Open the current garden before continuing.",
      );
    await refresh();
    if (generation.current === version && result.completed)
      setCelebration({
        id,
        fromStage: before?.stage ?? result.habit.stage,
        grew: result.grew,
        streak: result.habit.streak,
        phase: reducedMotion ? "grown" : "watering",
      });
    return result;
  }
  async function signOut() {
    await account.signOut();
  }
  return (
    <MotionConfig reducedMotion="user">
      <GardenContext.Provider
        value={{
          habits: state.habits,
          loading: state.loading,
          error: state.error,
          mode: state.mode,
          email: state.email,
          refresh,
          signOut,
          create: (input) => mutate((operations) => operations.create(input)),
          edit: (id, input) =>
            mutate((operations) => operations.edit(id, input)),
          remove: (id) => mutate((operations) => operations.remove(id)),
          complete,
          celebration,
          authConfigured: account.configured,
        }}
      >
        {children}
      </GardenContext.Provider>
    </MotionConfig>
  );
}

export function useGarden() {
  const context = useContext(GardenContext);
  if (!context) throw new Error("GardenProvider is required.");
  return context;
}
