-- Fanorona Online: policies needed for authenticated players to find/join waiting rooms.
-- Run this in Supabase SQL Editor after the initial game_rooms/game_messages schema.
-- The update grant is intentionally limited to guest_id and status for this first lobby stage.

drop policy if exists "fanorona_find_waiting_rooms" on public.game_rooms;
create policy "fanorona_find_waiting_rooms"
on public.game_rooms
for select
to authenticated
using (
  (status = 'waiting' and guest_id is null)
  or host_id = auth.uid()
  or guest_id = auth.uid()
);

drop policy if exists "fanorona_join_waiting_rooms" on public.game_rooms;
create policy "fanorona_join_waiting_rooms"
on public.game_rooms
for update
to authenticated
using (
  status = 'waiting'
  and guest_id is null
  and host_id <> auth.uid()
)
with check (
  guest_id = auth.uid()
  and status = 'playing'
  and host_id <> auth.uid()
);

-- Restrict direct updates to only the columns required by the join-room action.
revoke update on table public.game_rooms from anon, authenticated;
grant update (guest_id, status) on table public.game_rooms to authenticated;
