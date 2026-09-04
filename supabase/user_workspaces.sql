-- Execute uma vez no Supabase: SQL Editor → New query → Run.
-- Cada usuário possui exatamente uma área privada de trabalho, sincronizada entre dispositivos.

create table if not exists public.user_workspaces (
  user_id uuid primary key references auth.users(id) on delete cascade,
  data jsonb not null default '{"version": 1}'::jsonb,
  updated_at timestamptz not null default now()
);

alter table public.user_workspaces enable row level security;

drop policy if exists "Users read their own workspace" on public.user_workspaces;
create policy "Users read their own workspace"
  on public.user_workspaces for select
  using (auth.uid() = user_id);

drop policy if exists "Users create their own workspace" on public.user_workspaces;
create policy "Users create their own workspace"
  on public.user_workspaces for insert
  with check (auth.uid() = user_id);

drop policy if exists "Users update their own workspace" on public.user_workspaces;
create policy "Users update their own workspace"
  on public.user_workspaces for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
