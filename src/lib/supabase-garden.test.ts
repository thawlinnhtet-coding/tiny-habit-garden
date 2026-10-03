import { expect, it } from "vitest";
import { createSupabaseGarden } from "./supabase-garden";
import { PGlite } from "@electric-sql/pglite";
import { readFile } from "node:fs/promises";

it("uses the private server snapshot's date and timezone instead of the browser clock", async () => {
  const garden = createSupabaseGarden(
    async () => ({
      data: {
        now: "2026-10-03T18:00:00Z",
        timezone: "Asia/Rangoon",
        completed: false,
        habits: [
          {
            id: "habit-1",
            name: "Read",
            plantType: "mushroom",
            completionDates: ["2026-10-04"],
            createdAt: "2026-10-01T00:00:00Z",
          },
        ],
      },
      error: null,
    }),
    "UTC",
  );
  expect(await garden.read()).toMatchObject([
    {
      name: "Read",
      completedToday: true,
      totalCompletions: 1,
      streak: 1,
      stage: 2,
    },
  ]);
});

it("creates a private seed through the PostgreSQL migration", async () => {
  const db = new PGlite();
  try {
    await db.exec(
      `create role anon; create role authenticated; create schema auth; create table auth.users(id uuid primary key); create function auth.uid() returns uuid language sql as $$ select nullif(current_setting('test.user_id',true),'')::uuid $$; insert into auth.users values ('00000000-0000-0000-0000-000000000001'),('00000000-0000-0000-0000-000000000002');`,
    );
    await db.exec(
      await readFile("supabase/migrations/202610030001_garden.sql", "utf8"),
    );
    const requestFor = (owner: string) => async (p: Record<string, string>) => {
      return db.transaction(async (tx) => {
        await tx.exec("set local role authenticated");
        await tx.query("select set_config('test.user_id',$1,true)", [owner]);
        const result = await tx.query<{ data: unknown }>(
          "select public.garden_operation($1,$2,$3,$4,$5) data",
          [
            p.p_action,
            p.p_timezone,
            p.p_id ?? null,
            p.p_name ?? null,
            p.p_plant_type ?? null,
          ],
        );
        return { data: result.rows[0].data, error: null };
      });
    };
    const garden = createSupabaseGarden(
      requestFor("00000000-0000-0000-0000-000000000001"),
      "Asia/Rangoon",
    );
    const seed = await garden.create({
      name: "Study 30 minutes",
      plantType: "oak",
    });
    expect(seed).toMatchObject({
      name: "Study 30 minutes",
      stage: 1,
      totalCompletions: 0,
    });
    expect(await garden.read()).toMatchObject([
      { id: seed.id, name: "Study 30 minutes" },
    ]);
    const watering = await garden.complete(seed.id);
    expect(watering).toMatchObject({
      completed: true,
      grew: true,
      habit: { stage: 2, totalCompletions: 1, completedToday: true, streak: 1 },
    });
    expect(await garden.complete(seed.id)).toMatchObject({
      completed: false,
      grew: false,
      habit: { totalCompletions: 1 },
    });
    const sameAccountElsewhere = createSupabaseGarden(
      requestFor("00000000-0000-0000-0000-000000000001"),
      "Pacific/Honolulu",
    );
    expect(await sameAccountElsewhere.complete(seed.id)).toMatchObject({
      completed: false,
      habit: { totalCompletions: 1 },
    });
    const otherGarden = createSupabaseGarden(
      requestFor("00000000-0000-0000-0000-000000000002"),
      "UTC",
    );
    expect(await otherGarden.read()).toEqual([]);
    await expect(otherGarden.complete(seed.id)).rejects.toThrow("no longer");
    await expect(
      otherGarden.edit(seed.id, { name: "Intruder", plantType: "oak" }),
    ).rejects.toThrow("no longer");
    await expect(otherGarden.remove(seed.id)).rejects.toThrow("no longer");
    await garden.edit(seed.id, {
      name: "Study 20 minutes",
      plantType: "cactus",
    });
    expect(await garden.read()).toMatchObject([
      { id: seed.id, name: "Study 20 minutes", plantType: "cactus" },
    ]);
    await garden.remove(seed.id);
    expect(await garden.read()).toEqual([]);
  } finally {
    await db.close();
  }
}, 20000);

it("reports remote failures without substituting a guest garden", async () => {
  const garden = createSupabaseGarden(
    async () => ({ data: null, error: { message: "connection lost" } }),
    "UTC",
  );
  await expect(garden.read()).rejects.toThrow("connection lost");
  await expect(
    garden.create({ name: "Read", plantType: "oak" }),
  ).rejects.toThrow("connection lost");
});
