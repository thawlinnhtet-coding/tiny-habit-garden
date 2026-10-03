export const plantTypes = ["oak", "sunflower", "mushroom", "cactus", "wildflower"] as const;
export type PlantType = (typeof plantTypes)[number];
export type HabitInput = { name: string; plantType: PlantType };
export type Habit = HabitInput & { id: string; completionDates: string[]; createdAt: string };
export type GardenHabit = Habit & { stage: number; totalCompletions: number; streak: number; completedToday: boolean; progress: number; nextStageIn: number };
export interface GardenOperations {
  read(): Promise<GardenHabit[]>;
  create(input: HabitInput): Promise<GardenHabit>;
  edit(id: string, input: HabitInput): Promise<GardenHabit>;
  remove(id: string): Promise<void>;
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

export function createGuestGarden(storage: GardenStorage, now: () => Date = () => new Date(), timezone = Intl.DateTimeFormat().resolvedOptions().timeZone): GardenOperations {
  new Intl.DateTimeFormat("en-CA", { timeZone: timezone });
  function load(): Habit[] {
    return JSON.parse(storage.getItem(storageKey) ?? "[]") as Habit[];
  }
  function view(habit: Habit): GardenHabit {
    return { ...habit, stage: 1, totalCompletions: 0, streak: 0, completedToday: false, progress: 0, nextStageIn: 1 };
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
  };
}
