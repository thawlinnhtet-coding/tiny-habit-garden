-- Administrator-only cutover. Verify both account identities out of band,
-- back up the database, replace the two placeholders, and run in SQL Editor.
-- No email matching and no client-callable transfer function are introduced.
begin;
lock table public.garden_profiles, public.habits, public.habit_completions
  in share row exclusive mode;
do $$
declare
  old_owner text := 'REPLACE_WITH_VERIFIED_SUPABASE_UUID';
  new_owner text := 'REPLACE_WITH_VERIFIED_CLERK_USER_ID';
begin
  if old_owner !~ '^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$'
    or left(new_owner,5) <> 'user_' or length(new_owner) <= 5 then
    raise exception 'Replace both placeholders with verified account IDs.';
  end if;
  if not exists (select 1 from public.garden_profiles where user_id = old_owner) then
    raise exception 'The original garden profile was not found.';
  end if;
  if exists (select 1 from public.habits where user_id = new_owner) then
    raise exception 'The Clerk account already has plants. Resolve ownership before merging gardens.';
  end if;
  insert into public.garden_profiles(user_id,timezone,created_at)
    select new_owner,timezone,created_at from public.garden_profiles where user_id = old_owner
    on conflict (user_id) do update set timezone = excluded.timezone;
  update public.habits set user_id = new_owner where user_id = old_owner;
  delete from public.garden_profiles where user_id = old_owner;
end;
$$;
commit;
