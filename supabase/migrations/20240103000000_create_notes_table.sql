create table if not exists notes (
  id text primary key,
  x double precision not null,
  y double precision not null,
  title text,
  content text,
  created_at bigint,
  z_index integer,
  updated_at timestamp with time zone default timezone('utc'::text, now())
);

-- Enable RLS
alter table notes enable row level security;

-- Create policy to allow public access (for demo)
create policy "Allow public access" 
on notes 
for all 
using (true) 
with check (true);

-- Enable Realtime
alter publication supabase_realtime add table notes;
