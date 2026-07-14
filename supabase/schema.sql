-- Super José Treinamento — schema do Supabase
-- Rode este script no SQL Editor do seu projeto Supabase (Project > SQL Editor > New query).

-- 1) Tabela de itens (frutas/verduras + código)
create table if not exists public.items (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  code text not null,
  image_url text,
  created_at timestamptz not null default now()
);

alter table public.items enable row level security;

-- Leitura pública: qualquer pessoa pode ver os itens para jogar o quiz.
create policy "items_public_select" on public.items
  for select using (true);

-- Escrita pública: o painel do admin não usa login do Supabase, apenas uma
-- senha simples no front-end (ver VITE_ADMIN_PASSWORD no .env). Por isso as
-- políticas abaixo liberam insert/update/delete para a chave anon.
-- Se quiser proteção de verdade, troque isso por Supabase Auth (ver README).
create policy "items_public_insert" on public.items
  for insert with check (true);

create policy "items_public_update" on public.items
  for update using (true);

create policy "items_public_delete" on public.items
  for delete using (true);

-- 2) Bucket de imagens
insert into storage.buckets (id, name, public)
values ('item-images', 'item-images', true)
on conflict (id) do nothing;

-- Mesma lógica de acesso público do item acima, aplicada aos arquivos do bucket.
create policy "item_images_public_select" on storage.objects
  for select using (bucket_id = 'item-images');

create policy "item_images_public_insert" on storage.objects
  for insert with check (bucket_id = 'item-images');

create policy "item_images_public_delete" on storage.objects
  for delete using (bucket_id = 'item-images');
