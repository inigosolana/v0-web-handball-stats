-- Create Matches table
create table if not exists public.matches (
  id uuid primary key default gen_random_uuid(),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  date timestamp with time zone not null,
  local_team_id text not null, -- References team ID (text in your app currently)
  visitor_team_id text, -- ID or null if external
  visitor_team_name text, -- For ad-hoc visitor teams
  local_score int default 0,
  visitor_score int default 0,
  video_url text,
  status text default 'synced', -- 'synced', 'analyzed'
  external_id text -- ID from the external app for de-duplication
);

-- Create Match Events table
create table if not exists public.match_events (
  id uuid primary key default gen_random_uuid(),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  match_id uuid references public.matches(id) on delete cascade not null,
  player_id text, -- References player ID
  team_id text, -- References team ID (to separate Attack/Defense)
  event_type text not null, -- 'goal', 'save', 'miss', 'turnover', 'steal', '7m_goal', '7m_miss'
  time_seconds int not null, -- Start time of the action
  end_time int, -- End time of the action (optional, for clips)
  coord_x float, -- 0-100%
  coord_y float, -- 0-100%
  tags text[], -- Array of tags e.g. ['fast_break', 'wing_shot']
  is_verified boolean default false, -- For AI training data
  confidence_score float, -- 0.0 to 1.0
  model_version text, -- e.g. 'v1.0.0'
  feedback_status text default 'pending', -- 'pending', 'approved', 'rejected', 'corrected'
  metadata jsonb -- For any extra data
);

-- Indexes for performance
create index if not exists matches_local_team_id_idx on public.matches(local_team_id);
create index if not exists match_events_match_id_idx on public.match_events(match_id);
create index if not exists match_events_player_id_idx on public.match_events(player_id);

-- Enable RLS (Row Level Security)
alter table public.matches enable row level security;
alter table public.match_events enable row level security;

-- Policy: Coaches can insert matches for their teams
-- Note: You'll need to adjust this based on your exact 'coach_teams' logic
create policy "Coaches can insert matches"
on public.matches for insert
with check (
  auth.uid() is not null 
  -- Add specific team ownership check here if needed
);

-- Policy: Authenticated users can read matches
create policy "Authenticated users can read matches"
on public.matches for select
using (auth.role() = 'authenticated');

create policy "Authenticated users can read events"
on public.match_events for select
using (auth.role() = 'authenticated');
