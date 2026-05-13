-- ============================================================
-- LA FUENTE SUPERMARKET - Database Schema
-- ============================================================
-- Hybrid approach: static products.ts stays as base catalog.
-- Supabase stores only:
--   1) Overrides for existing products (price, image, hidden)
--   2) New products added by admin
-- ============================================================

-- Overrides for the 7415 static products in products.ts
create table if not exists product_overrides (
  product_id   text primary key,
  price        numeric,
  image_url    text,
  hidden       boolean default false,
  updated_at   timestamptz default now()
);

-- New products created from the admin panel
create table if not exists custom_products (
  id           uuid primary key default gen_random_uuid(),
  sku          text,
  name         text not null,
  category     text not null,
  price        numeric not null,
  image_url    text,
  created_at   timestamptz default now(),
  updated_at   timestamptz default now()
);

-- Auto-update updated_at on row changes
create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_overrides_updated_at on product_overrides;
create trigger trg_overrides_updated_at
  before update on product_overrides
  for each row execute function set_updated_at();

drop trigger if exists trg_custom_products_updated_at on custom_products;
create trigger trg_custom_products_updated_at
  before update on custom_products
  for each row execute function set_updated_at();

-- ============================================================
-- Row Level Security
-- ============================================================
alter table product_overrides enable row level security;
alter table custom_products  enable row level security;

-- Anyone (including anon clients) can read
drop policy if exists "Public read overrides" on product_overrides;
create policy "Public read overrides"
  on product_overrides for select using (true);

drop policy if exists "Public read custom_products" on custom_products;
create policy "Public read custom_products"
  on custom_products for select using (true);

-- Only authenticated (admin) users can write
drop policy if exists "Auth insert overrides" on product_overrides;
create policy "Auth insert overrides"
  on product_overrides for insert to authenticated with check (true);

drop policy if exists "Auth update overrides" on product_overrides;
create policy "Auth update overrides"
  on product_overrides for update to authenticated using (true);

drop policy if exists "Auth delete overrides" on product_overrides;
create policy "Auth delete overrides"
  on product_overrides for delete to authenticated using (true);

drop policy if exists "Auth insert custom_products" on custom_products;
create policy "Auth insert custom_products"
  on custom_products for insert to authenticated with check (true);

drop policy if exists "Auth update custom_products" on custom_products;
create policy "Auth update custom_products"
  on custom_products for update to authenticated using (true);

drop policy if exists "Auth delete custom_products" on custom_products;
create policy "Auth delete custom_products"
  on custom_products for delete to authenticated using (true);
