import { describe, expect, it } from "vitest";
import { createGuestGarden } from "./garden";

function memoryStorage() {
  const values = new Map<string, string>();
  return {
    getItem: (key: string) => values.get(key) ?? null,
    setItem: (key: string, value: string) => { values.set(key, value); },
  };
}

describe("guest garden operations", () => {
  it("plants a named habit as a seed and keeps it across visits", async () => {
    const storage = memoryStorage();
    const garden = createGuestGarden(storage, () => new Date("2026-10-03T06:00:00Z"), "Asia/Rangoon");
    const habit = await garden.create({ name: "Study 30 minutes", plantType: "oak" });
    const returningGarden = createGuestGarden(storage, () => new Date("2026-10-03T06:00:00Z"), "Asia/Rangoon");
    expect(await returningGarden.read()).toMatchObject([{ id: habit.id, name: "Study 30 minutes", plantType: "oak", stage: 1, totalCompletions: 0 }]);
  });
  it("edits the habit and plant while keeping its identity, then removes it", async () => {
    const garden = createGuestGarden(memoryStorage());
    const habit = await garden.create({ name: "Read", plantType: "mushroom" });
    await garden.edit(habit.id, { name: "Read 10 pages", plantType: "wildflower" });
    expect(await garden.read()).toMatchObject([{ id: habit.id, name: "Read 10 pages", plantType: "wildflower" }]);
    await garden.remove(habit.id);
    expect(await garden.read()).toEqual([]);
  });
  it("rejects empty names and unsupported plants without changing the garden", async () => {
    const garden = createGuestGarden(memoryStorage());
    await expect(garden.create({ name: "   ", plantType: "oak" })).rejects.toThrow("name");
    await expect(garden.create({ name: "Read", plantType: "dragon" as "oak" })).rejects.toThrow("plant");
    expect(await garden.read()).toEqual([]);
  });
});
