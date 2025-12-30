-- Create Transactions Table for Supabase Data Source

create table public.transactions (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid references public.tenants not null,
  
  -- Core Fields mapping to Dashboard
  data_vencimento date,
  descricao text,
  responsavel text,
  categoria text,
  status text default 'Pendente',
  tipo text default 'Saída', -- 'Entrada' or 'Saída'
  forma_pag text,
  conta text,
  
  -- Values
  valor_liq numeric default 0,
  valor_bruto numeric default 0,
  
  -- Classification
  is_variavel boolean default true,
  classificacao text default 'Variável', -- 'Fixa' or 'Variável'
  
  -- Execution
  data_pagamento date,
  observacao text,
  
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.transactions enable row level security;

-- Policy: Users can view transactions of their tenant
create policy "Users can view own tenant transactions"
  on public.transactions for select
  using (
    exists (
      select 1 from public.profiles
      where profiles.tenant_id = transactions.tenant_id
      and profiles.id = auth.uid()
    )
  );

-- Policy: Users can insert/update/delete based on same rule (simplified)
create policy "Users can modify own tenant transactions"
  on public.transactions for all
  using (
    exists (
      select 1 from public.profiles
      where profiles.tenant_id = transactions.tenant_id
      and profiles.id = auth.uid()
    )
  );
