export const plantTypes = ["oak", "sunflower", "mushroom", "cactus", "wildflower"] as const;
export type PlantType = (typeof plantTypes)[number];
export type HabitInput = { name: string; plantType: PlantType };
export type Habit = HabitInput & { id: string; completionDates: string[]; createdAt: string };
export type GardenHabit = Habit & { stage: number; totalCompletions: number; streak: number; completedToday: boolean; progress: number; nextStageIn: number };
export type CompletionResult = { habit: GardenHabit; completed: boolean; grew: boolean };
export interface GardenOperations {
  read(): Promise<GardenHabit[]>;
  create(input: HabitInput): Promise<GardenHabit>;
  edit(id: string, input: HabitInput): Promise<GardenHabit>;
  remove(id: string): Promise<void>;
  complete(id: string): Promise<CompletionResult>;
}
export interface GardenStorage {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
}

const storageKey = "tiny-habit-garden:guest:v1";

export function validateHabit(input: HabitInput): HabitInput {
  const name = input.name.trim();
  if (!name || name.length > 80) throw new Error("Give your habit a name between 1 and 80 characters.");
  if (!plantTypes.includes(input.plantType)) throw new Error("Choose a plant from the garden's plant types.");
  return { name, plantType: input.plantType };
}

export function localDate(date: Date, timezone: string): string {
  const parts = new Intl.DateTimeFormat("en-CA", { timeZone: timezone, year: "numeric", month: "2-digit", day: "2-digit" }).formatToParts(date);
  return ["year", "month", "day"].map((type) => parts.find((part) => part.type === type)!.value).join("-");
}

export function describeHabit(habit: Habit, now: Date, timezone: string): GardenHabit {
  const today = localDate(now, timezone);
  const dates = new Set(habit.completionDates);
  const completedToday = dates.has(today);
  const totalCompletions = dates.size;
  function previousDate(date: string) { return new Date(Date.parse(`${date}T00:00:00Z`) - 86400000).toISOString().slice(0, 10); }
  let cursor = completedToday ? today : previousDate(today);
  let streak = 0;
  while (dates.has(cursor)) { streak++; cursor = previousDate(cursor); }
  const thresholds = [0, 1, 3, 7, 14];
  const stage = thresholds.filter((threshold) => totalCompletions >= threshold).length;
  const floor = thresholds[stage - 1];
  const ceiling = thresholds[stage];
  return { ...habit, stage, totalCompletions, streak, completedToday, progress: ceiling === undefined ? 100 : Math.round((totalCompletions - floor) / (ceiling - floor) * 100), nextStageIn: ceiling === undefined ? 0 : ceiling - totalCompletions };
}

export function createGuestGarden(storage: GardenStorage, now: () => Date = () => new Date(), timezone = Intl.DateTimeFormat().resolvedOptions().timeZone): GardenOperations {
  function load(): Habit[] {
    const parsed: unknown = JSON.parse(storage.getItem(storageKey) ?? "[]");
    if (!Array.isArray(parsed) || parsed.some((habit) => !habit || typeof habit.id !== "string" || !habit.id || typeof habit.name !== "string" || !habit.name.trim() || habit.name.length > 80 || !plantTypes.includes(habit.plantType) || !Array.isArray(habit.completionDates) || habit.completionDates.some((date: unknown) => typeof date !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(date)) || typeof habit.createdAt !== "string" || !Number.isFinite(Date.parse(habit.createdAt)))) {
      throw new Error("Your saved garden contains damaged data. Its original contents have been preserved.");
    }
    return parsed as Habit[];
  }
  function view(habit: Habit): GardenHabit {
    return describeHabit(habit, now(), timezone);
  }
  return {
    async read() { return load().map(view); },
    async create(input) {
      const habit: Habit = { ...validateHabit(input), id: crypto.randomUUID(), completionDates: [], createdAt: now().toISOString() };
      const habits = [...load(), habit];
      storage.setItem(storageKey, JSON.stringify(habits));
      return view(habit);
    },
    async edit(id, input) {
      const habits = load();
      const index = habits.findIndex((habit) => habit.id === id);
      if (index < 0) throw new Error("This habit is no longer in your garden.");
      habits[index] = { ...habits[index], ...validateHabit(input) };
      storage.setItem(storageKey, JSON.stringify(habits));
      return view(habits[index]);
    },
    async remove(id) {
      storage.setItem(storageKey, JSON.stringify(load().filter((habit) => habit.id !== id)));
    },
    async complete(id) {
      const habits = load();
      const habit = habits.find((item) => item.id === id);
      if (!habit) throw new Error("This habit is no longer in your garden.");
      const before = view(habit);
      if (before.completedToday) return { habit: before, completed: false, grew: false };
      habit.completionDates.push(localDate(now(), timezone));
      storage.setItem(storageKey, JSON.stringify(habits));
      const after = view(habit);
      return { habit: after, completed: true, grew: after.stage > before.stage };
    },
  };
}
