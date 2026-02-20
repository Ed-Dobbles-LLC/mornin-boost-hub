-- Contacts table for Dobbles.AI contact form submissions
create table if not exists public.contacts (
  id         uuid primary key default gen_random_uuid(),
  name       text not null,
  email      text not null,
  reason     text,
  message    text not null,
  created_at timestamp with time zone default now()
);

-- Only authenticated users (you) can read contacts; anyone can insert (contact form)
alter table public.contacts enable row level security;

create policy "Anyone can submit contact form"
  on public.contacts for insert
  with check (true);

create policy "Authenticated user can read contacts"
  on public.contacts for select
  using (auth.role() = 'authenticated');
