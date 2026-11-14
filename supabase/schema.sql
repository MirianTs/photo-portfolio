-- Run this in the Supabase SQL Editor (Project > SQL Editor > New query)
-- The whole script is safe to re-run: each policy is dropped first, because
-- Postgres has no "create policy if not exists".

create table if not exists photos (
  id uuid primary key default gen_random_uuid(),
  url text not null,
  storage_path text not null,
  category text not null default 'uncategorized',
  position integer not null default 0,
  created_at timestamptz not null default now()
);

-- The gallery and admin panel always sort by position.
create index if not exists photos_position_idx on photos (position);

alter table photos enable row level security;

drop policy if exists "Public can read photos" on photos;
create policy "Public can read photos"
  on photos for select
  using (true);

drop policy if exists "Authenticated users can manage photos" on photos;
create policy "Authenticated users can manage photos"
  on photos for all
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

-- Storage: create a bucket named "photos" (Storage > New bucket > Public bucket) first, then run:

drop policy if exists "Public can read photo files" on storage.objects;
create policy "Public can read photo files"
  on storage.objects for select
  using (bucket_id = 'photos');

drop policy if exists "Authenticated users can upload photo files" on storage.objects;
create policy "Authenticated users can upload photo files"
  on storage.objects for insert
  with check (bucket_id = 'photos' and auth.role() = 'authenticated');

drop policy if exists "Authenticated users can delete photo files" on storage.objects;
create policy "Authenticated users can delete photo files"
  on storage.objects for delete
  using (bucket_id = 'photos' and auth.role() = 'authenticated');
