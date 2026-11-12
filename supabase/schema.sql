-- Run this once in the Supabase SQL Editor (Project > SQL Editor > New query)
-- The table and index are safe to re-run; the policies are not (create policy fails if one already exists).

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

create policy "Public can read photos"
  on photos for select
  using (true);

create policy "Authenticated users can manage photos"
  on photos for all
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

-- Storage: create a bucket named "photos" (Storage > New bucket > Public bucket) first, then run:

create policy "Public can read photo files"
  on storage.objects for select
  using (bucket_id = 'photos');

create policy "Authenticated users can upload photo files"
  on storage.objects for insert
  with check (bucket_id = 'photos' and auth.role() = 'authenticated');

create policy "Authenticated users can delete photo files"
  on storage.objects for delete
  using (bucket_id = 'photos' and auth.role() = 'authenticated');
