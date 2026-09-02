-- Execute este arquivo uma vez no Supabase: SQL Editor → New query → Run.
create table if not exists public.ai_conversations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null check (role in ('user', 'assistant')),
  content text not null check (char_length(content) <= 8000),
  sources jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists ai_conversations_user_created_at_idx
  on public.ai_conversations (user_id, created_at);

alter table public.ai_conversations enable row level security;

drop policy if exists "Users read their own AI conversations" on public.ai_conversations;
create policy "Users read their own AI conversations"
  on public.ai_conversations for select
  using (auth.uid() = user_id);

drop policy if exists "Users add their own AI conversations" on public.ai_conversations;
create policy "Users add their own AI conversations"
  on public.ai_conversations for insert
  with check (auth.uid() = user_id);

drop policy if exists "Users delete their own AI conversations" on public.ai_conversations;
create policy "Users delete their own AI conversations"
  on public.ai_conversations for delete
  using (auth.uid() = user_id);
