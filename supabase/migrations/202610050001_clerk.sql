begin;

-- Preserve existing UUID owners as text. Clerk subjects are user_... strings.
-- Existing accounts require a verified administrator mapping before cutover.
drop policy "Read own profile" on public.garden_profiles;
drop policy "Read own habits" on public.habits;
drop policy "Read own completions" on public.habit_completions;
alter table public.garden_profiles drop constraint garden_profiles_user_id_fkey;
alter table public.habits drop constraint habits_user_id_fkey;
alter table public.garden_profiles alter column user_id type text using user_id::text;
alter table public.habits alter column user_id type text using user_id::text;

create policy "Read own profile" on public.garden_profiles for select to authenticated
  using (user_id = (select auth.jwt()->>'sub'));
create policy "Read own habits" on public.habits for select to authenticated
  using (user_id = (select auth.jwt()->>'sub'));
create policy "Read own completions" on public.habit_completions for select to authenticated
  using (exists (select 1 from public.habits h where h.id = habit_id and h.user_id = (select auth.jwt()->>'sub')));

create or replace function public.garden_operation(
  p_action text default 'read',
  p_timezone text default 'UTC',
  p_id uuid default null,
  p_name text default null,
  p_plant_type text default null
) returns jsonb language plpgsql security definer set search_path = '' as $$
declare
  owner_id text := nullif(auth.jwt()->>'sub','');
  account_timezone text;
  server_now timestamptz;
  today date;
  changed_id uuid := p_id;
  inserted_count integer := 0;
  garden jsonb;
begin
  if owner_id is null then raise exception 'Sign in to open your private garden.' using errcode = '42501'; end if;
  if p_action not in ('read','create','edit','remove','complete') or p_action is null then raise exception 'Unknown garden operation.'; end if;
  select timezone into account_timezone from public.garden_profiles where user_id = owner_id;
  if account_timezone is null then
    if not exists (select 1 from pg_catalog.pg_timezone_names where name = p_timezone) then raise exception 'Choose a valid timezone.'; end if;
    insert into public.garden_profiles(user_id, timezone) values (owner_id, p_timezone) on conflict (user_id) do nothing;
    select timezone into account_timezone from public.garden_profiles where user_id = owner_id;
  end if;
  if p_action in ('create','edit') then
    if p_name is null or char_length(btrim(p_name)) not between 1 and 80 then raise exception 'Give your habit a name between 1 and 80 characters.'; end if;
    if p_plant_type is null or p_plant_type not in ('oak','sunflower','mushroom','cactus','wildflower') then raise exception 'Choose a supported plant.'; end if;
  end if;
  if p_action = 'create' then
    insert into public.habits(user_id,name,plant_type) values (owner_id,btrim(p_name),p_plant_type) returning id into changed_id;
  elsif p_action = 'edit' then
    update public.habits set name = btrim(p_name), plant_type = p_plant_type where id = p_id and user_id = owner_id;
    if not found then raise exception 'This habit is no longer in your garden.'; end if;
  elsif p_action = 'remove' then
    delete from public.habits where id = p_id and user_id = owner_id;
    if not found then raise exception 'This habit is no longer in your garden.'; end if;
  elsif p_action = 'complete' then
    perform 1 from public.habits where id = p_id and user_id = owner_id for update;
    if not found then raise exception 'This habit is no longer in your garden.'; end if;
    server_now := clock_timestamp();
    today := (server_now at time zone account_timezone)::date;
    insert into public.habit_completions(habit_id,completion_date,completed_at) values (p_id,today,server_now) on conflict (habit_id,completion_date) do nothing;
    get diagnostics inserted_count = row_count;
  end if;
  server_now := coalesce(server_now,clock_timestamp());
  select coalesce(jsonb_agg(item order by created_at,id),'[]'::jsonb) into garden from (
    select h.created_at,h.id,jsonb_build_object(
      'id',h.id,'name',h.name,'plantType',h.plant_type,'createdAt',h.created_at,
      'completionDates',coalesce((select jsonb_agg(c.completion_date order by c.completion_date) from public.habit_completions c where c.habit_id = h.id),'[]'::jsonb)
    ) item from public.habits h where h.user_id = owner_id
  ) owned;
  return jsonb_build_object('habits',garden,'now',server_now,'timezone',account_timezone,'completed',inserted_count = 1,'changedId',changed_id);
end;
$$;

revoke all on function public.garden_operation(text,text,uuid,text,text) from public, anon;
grant execute on function public.garden_operation(text,text,uuid,text,text) to authenticated;
commit;
