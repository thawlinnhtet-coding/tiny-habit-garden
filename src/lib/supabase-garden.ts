import { describeHabit, localDate, validateHabit, type GardenOperations, type Habit } from "./garden";

type Snapshot = { now: string; timezone: string; habits: Habit[]; completed: boolean; changedId?: string };
export type GardenRequest = (parameters: Record<string, string>) => PromiseLike<{ data: unknown; error: { message: string } | null }>;

export function createSupabaseGarden(request: GardenRequest, timezone: string): GardenOperations {
  async function run(action: string, parameters: Record<string, string> = {}) {
    const { data, error } = await request({ p_action: action, p_timezone: timezone, ...parameters });
    if (error) throw new Error(`Your private garden couldn't be saved or opened: ${error.message}`);
    if (!data || typeof data !== "object" || !("habits" in data) || !Array.isArray(data.habits)) throw new Error("Your private garden returned an unexpected response. Please reload.");
    const snapshot = data as Snapshot;
    return { ...snapshot, habits: snapshot.habits.map((habit) => describeHabit(habit, new Date(snapshot.now), snapshot.timezone)) };
  }
  return {
    async read() { return (await run("read")).habits; },
    async create(input) {
      const valid = validateHabit(input);
      const result = await run("create", { p_name: valid.name, p_plant_type: valid.plantType });
      const habit = result.habits.find((item) => item.id === result.changedId);
      if (!habit) throw new Error("The saved plant couldn't be found. Reload your garden.");
      return habit;
    },
    async edit(id, input) {
      const valid = validateHabit(input);
      const result = await run("edit", { p_id: id, p_name: valid.name, p_plant_type: valid.plantType });
      const habit = result.habits.find((item) => item.id === id);
      if (!habit) throw new Error("This plant is no longer in your garden.");
      return habit;
    },
    async remove(id) { await run("remove", { p_id: id }); },
    async complete(id) {
      const result = await run("complete", { p_id: id });
      const habit = result.habits.find((item) => item.id === id);
      if (!habit) throw new Error("This plant is no longer in your garden.");
      const date = localDate(new Date(result.now), result.timezone);
      const before = describeHabit({ ...habit, completionDates: habit.completionDates.filter((item) => item !== date) }, new Date(result.now), result.timezone);
      return { habit, completed: result.completed, grew: result.completed && habit.stage > before.stage };
    },
  };
}
