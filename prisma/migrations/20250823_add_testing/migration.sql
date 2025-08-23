-- Create Testing table (tracks basic test records)
-- Safe to run multiple times
create table if not exists "Testing" (
  id text primary key,
  name text,
  "createdAt" timestamptz not null default now()
);


