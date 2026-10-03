import { describe, expect, it } from "vitest";
import { createGuestGarden } from "./garden";

function memoryStorage() {
  const values = new Map<string, string>();
  return {
    getItem: (key: string) => values.get(key) ?? null,
    setItem: (key: string, value: string) => {
      values.set(key, value);
    },
  };
}

describe("guest garden operations", () => {
  it("plants a named habit as a seed and keeps it across visits", async () => {
    const storage = memoryStorage();
    const garden = createGuestGarden(
      storage,
      () => new Date("2026-10-03T06:00:00Z"),
    );
    const habit = await garden.create({
      name: "Study 30 minutes",
      plantType: "oak",
    });
    const returningGarden = createGuestGarden(
      storage,
      () => new Date("2026-10-03T06:00:00Z"),
    );
    expect(await returningGarden.read()).toMatchObject([
      {
        id: habit.id,
        name: "Study 30 minutes",
        plantType: "oak",
        stage: 1,
        totalCompletions: 0,
      },
    ]);
  });
  it("edits the habit and plant while keeping its identity, then removes it", async () => {
    const garden = createGuestGarden(memoryStorage());
    const habit = await garden.create({ name: "Read", plantType: "mushroom" });
    await garden.edit(habit.id, {
      name: "Read 10 pages",
      plantType: "wildflower",
    });
    expect(await garden.read()).toMatchObject([
      { id: habit.id, name: "Read 10 pages", plantType: "wildflower" },
    ]);
    await garden.remove(habit.id);
    expect(await garden.read()).toEqual([]);
  });
  it("rejects empty names and unsupported plants without changing the garden", async () => {
    const garden = createGuestGarden(memoryStorage());
    await expect(
      garden.create({ name: "   ", plantType: "oak" }),
    ).rejects.toThrow("name");
    await expect(
      garden.create({ name: "Read", plantType: "dragon" as "oak" }),
    ).rejects.toThrow("plant");
    expect(await garden.read()).toEqual([]);
  });
  it("trims valid habit names and enforces the 80-character limit", async () => {
    const garden = createGuestGarden(memoryStorage());
    const habit = await garden.create({
      name: ` ${"a".repeat(80)} `,
      plantType: "oak",
    });
    expect(habit.name).toBe("a".repeat(80));
    await expect(
      garden.create({ name: "a".repeat(81), plantType: "oak" }),
    ).rejects.toThrow("1 and 80 characters");
    expect(await garden.read()).toHaveLength(1);
  });
  it("reports damaged saved records without overwriting recoverable data", async () => {
    const values = new Map<string, string>();
    const storage = {
      getItem: (key: string) => values.get(key) ?? null,
      setItem: (key: string, value: string) => {
        values.set(key, value);
      },
    };
    const garden = createGuestGarden(storage);
    await garden.create({ name: "Read", plantType: "mushroom" });
    for (const [key, value] of values)
      values.set(key, value.replace('"mushroom"', '"unsupported"'));
    const before = [...values.values()];
    await expect(garden.read()).rejects.toThrow("saved garden");
    expect([...values.values()]).toEqual(before);
  });
  it("waters a habit once per local date and grows its seed into a sprout", async () => {
    const garden = createGuestGarden(
      memoryStorage(),
      () => new Date("2026-10-03T18:00:00Z"),
      "Asia/Rangoon",
    );
    const habit = await garden.create({ name: "Walk", plantType: "sunflower" });
    const result = await garden.complete(habit.id);
    expect(result).toMatchObject({
      completed: true,
      grew: true,
      habit: {
        completionDates: ["2026-10-04"],
        totalCompletions: 1,
        stage: 2,
        streak: 1,
        completedToday: true,
      },
    });
    expect(await garden.complete(habit.id)).toMatchObject({
      completed: false,
      grew: false,
      habit: { totalCompletions: 1, streak: 1 },
    });
  });
  it("keeps yesterday's streak current, resets a missed day, and retains lifetime growth", async () => {
    let day = new Date("2026-10-01T06:00:00Z");
    const garden = createGuestGarden(
      memoryStorage(),
      () => day,
      "Asia/Rangoon",
    );
    const habit = await garden.create({ name: "Read", plantType: "mushroom" });
    await garden.complete(habit.id);
    day = new Date("2026-10-02T06:00:00Z");
    expect((await garden.read())[0]).toMatchObject({
      streak: 1,
      completedToday: false,
    });
    expect(await garden.complete(habit.id)).toMatchObject({
      habit: { streak: 2, totalCompletions: 2 },
    });
    day = new Date("2026-10-04T06:00:00Z");
    expect((await garden.read())[0]).toMatchObject({
      streak: 0,
      totalCompletions: 2,
      stage: 2,
    });
    expect(await garden.complete(habit.id)).toMatchObject({
      habit: { streak: 1, totalCompletions: 3 },
    });
  });
  it("reaches all five growth milestones and keeps growth when the plant type changes", async () => {
    let day = new Date("2026-10-01T12:00:00Z");
    const garden = createGuestGarden(memoryStorage(), () => day, "UTC");
    const habit = await garden.create({
      name: "Stretch",
      plantType: "sunflower",
    });
    for (let index = 1; index <= 14; index++) {
      day = new Date(`2026-10-${String(index).padStart(2, "0")}T12:00:00Z`);
      const result = await garden.complete(habit.id);
      if (index === 3)
        expect(result).toMatchObject({
          grew: true,
          habit: { stage: 3, nextStageIn: 4 },
        });
      if (index === 7)
        expect(result).toMatchObject({
          grew: true,
          habit: { stage: 4, streak: 7, nextStageIn: 7 },
        });
      if (index === 14)
        expect(result).toMatchObject({
          grew: true,
          habit: { stage: 5, streak: 14, totalCompletions: 14, progress: 100 },
        });
    }
    await garden.edit(habit.id, {
      name: "Gentle stretching",
      plantType: "oak",
    });
    expect((await garden.read())[0]).toMatchObject({
      plantType: "oak",
      totalCompletions: 14,
      stage: 5,
    });
  });
});
