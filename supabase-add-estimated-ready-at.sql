alter table orders add column if not exists estimated_ready_at timestamptz;
notify pgrst, 'reload schema';
