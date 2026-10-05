import { expect, it } from "vitest";
import { createSupabaseGarden } from "./supabase-garden";
import { PGlite } from "@electric-sql/pglite";
import { readFile, readdir } from "node:fs/promises";

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

it("keeps Clerk gardens separate and preserves pre-migration plants", async () => {
  const db = new PGlite();
  try {
    await db.exec(`
      create role anon; create role authenticated; create schema auth;
      create table auth.users(id uuid primary key);
      create function auth.uid() returns uuid language sql as $$ select nullif(current_setting('test.subject',true),'')::uuid $$;
      create function auth.jwt() returns jsonb language sql as $$ select jsonb_build_object('sub',current_setting('test.subject',true)) $$;
      insert into auth.users values ('00000000-0000-0000-0000-000000000001');
    `);
    const migrations = (await readdir("supabase/migrations")).sort();
    await db.exec(
      await readFile(`supabase/migrations/${migrations[0]}`, "utf8"),
    );
    await db.exec(`
      insert into public.garden_profiles(user_id,timezone) values ('00000000-0000-0000-0000-000000000001','Asia/Rangoon');
      insert into public.habits(id,user_id,name,plant_type) values ('00000000-0000-0000-0000-000000000010','00000000-0000-0000-0000-000000000001','Existing oak','oak');
      insert into public.habit_completions(habit_id,completion_date) values ('00000000-0000-0000-0000-000000000010','2026-10-01');
    `);
    for (const migration of migrations.slice(1))
      await db.exec(await readFile(`supabase/migrations/${migration}`, "utf8"));
    const asUser = <T>(
      subject: string,
      action: (tx: Pick<PGlite, "exec" | "query">) => Promise<T>,
    ) =>
      db.transaction(async (tx) => {
        await tx.exec("set local role authenticated");
        await tx.query("select set_config('test.subject',$1,true)", [subject]);
        return action(tx);
      });
    const requestFor = (subject: string) => (p: Record<string, string>) =>
      asUser(subject, async (tx) => {
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
    const alice = createSupabaseGarden(
      requestFor("user_clerk_alice"),
      "Asia/Rangoon",
    );
    const seed = await alice.create({ name: "Read", plantType: "mushroom" });
    expect(await alice.complete(seed.id)).toMatchObject({
      completed: true,
      habit: { stage: 2, totalCompletions: 1 },
    });
    expect(await alice.complete(seed.id)).toMatchObject({
      completed: false,
      habit: { totalCompletions: 1 },
    });
    const bob = createSupabaseGarden(requestFor("user_clerk_bob"), "UTC");
    expect(await bob.read()).toEqual([]);
    await expect(
      bob.edit(seed.id, { name: "Stolen", plantType: "oak" }),
    ).rejects.toThrow("no longer");
    await expect(bob.complete(seed.id)).rejects.toThrow("no longer");
    await expect(bob.remove(seed.id)).rejects.toThrow("no longer");
    expect(
      await asUser("user_clerk_bob", (tx) =>
        tx.query("select * from public.habits"),
      ),
    ).toMatchObject({ rows: [] });
    await expect(
      asUser("user_clerk_bob", (tx) =>
        tx.exec("update public.habits set name='Stolen'"),
      ),
    ).rejects.toThrow("permission denied");
    await expect(
      createSupabaseGarden(requestFor(""), "UTC").read(),
    ).rejects.toThrow("Sign in");
    const legacy = createSupabaseGarden(
      requestFor("00000000-0000-0000-0000-000000000001"),
      "UTC",
    );
    expect(await legacy.read()).toMatchObject([
      {
        name: "Existing oak",
        totalCompletions: 1,
        completionDates: ["2026-10-01"],
      },
    ]);
    const transfer = await readFile(
      "supabase/manual/transfer-garden-owner.sql",
      "utf8",
    );
    await expect(db.exec(transfer)).rejects.toThrow(
      "Replace both placeholders",
    );
    await db.exec("rollback");
    const verifiedTransfer = transfer
      .replace(
        "REPLACE_WITH_VERIFIED_SUPABASE_UUID",
        "00000000-0000-0000-0000-000000000001",
      )
      .replace("REPLACE_WITH_VERIFIED_CLERK_USER_ID", "user_clerk_alice");
    await expect(db.exec(verifiedTransfer)).rejects.toThrow(
      "already has plants",
    );
    await db.exec("rollback");
    await alice.remove(seed.id);
    expect(await alice.read()).toEqual([]);
    await db.exec(verifiedTransfer);
    expect(await alice.read()).toMatchObject([
      {
        name: "Existing oak",
        totalCompletions: 1,
        completionDates: ["2026-10-01"],
      },
    ]);
    expect(await legacy.read()).toEqual([]);
    expect(
      await requestFor("user_clerk_alice")({
        p_action: "read",
        p_timezone: "UTC",
      }),
    ).toMatchObject({ data: { timezone: "Asia/Rangoon" } });
  } finally {
    await db.close();
  }
}, 20000);
