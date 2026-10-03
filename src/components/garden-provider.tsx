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
import type { User } from "@supabase/supabase-js";
import {
  createGuestGarden,
  type CompletionResult,
  type GardenHabit,
  type GardenOperations,
  type HabitInput,
} from "@/lib/garden";
import { createSupabaseGarden } from "@/lib/supabase-garden";
import { browserSupabase, supabaseConfigured } from "@/lib/supabase/client";

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
};
const GardenContext = createContext<GardenContextValue | null>(null);

export function GardenProvider({ children }: { children: React.ReactNode }) {
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
    let currentUserId: string | null | undefined;
    function invalidate() {
      active = false;
      generation.current++;
    }
    function open(user: User | null) {
      if (!active || currentUserId === (user?.id ?? null)) return;
      currentUserId = user?.id ?? null;
      const version = ++generation.current;
      const mode = user ? "private" : "guest";
      const email = user?.email ?? null;
      setCelebration(null);
      setState({
        habits: [],
        operations: null,
        loading: true,
        error: "",
        mode,
        email,
      });
      // Auth events must return before making another Supabase request.
      queueMicrotask(async () => {
        if (!active || generation.current !== version) return;
        let operations: GardenOperations | null = null;
        try {
          if (user) {
            const client = browserSupabase();
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
              error: user
                ? `${cause instanceof Error ? cause.message : "Your private garden couldn't be opened."} Check the Supabase setup, then reload.`
                : "We couldn't open your saved guest garden. Its data has been preserved. Check browser storage permissions and reload.",
            });
        }
      });
    }
    if (!supabaseConfigured) {
      queueMicrotask(() => open(null));
      return invalidate;
    }
    const client = browserSupabase();
    const initialVersion = generation.current;
    const { data: subscription } = client.auth.onAuthStateChange(
      (event, session) => {
        if (event !== "INITIAL_SESSION") open(session?.user ?? null);
      },
    );
    client.auth
      .getUser()
      .then(({ data, error }) => {
        if (!active || generation.current !== initialVersion) return;
        if (error && error.name !== "AuthSessionMissingError") {
          setState({
            habits: [],
            operations: null,
            loading: false,
            mode: "unavailable",
            email: null,
            error:
              "We couldn't verify your account. Check your connection and reload. Your private garden hasn't been replaced with a guest garden.",
          });
        } else open(data.user);
      })
      .catch(() => {
        if (active && generation.current === initialVersion)
          setState((previous) => ({
            ...previous,
            loading: false,
            error:
              "We couldn't connect to your account. Please reload when you're online.",
          }));
      });
    return () => {
      invalidate();
      subscription.subscription.unsubscribe();
    };
  }, []);
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
    const { error } = await browserSupabase().auth.signOut({ scope: "local" });
    if (error) throw new Error(error.message);
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
