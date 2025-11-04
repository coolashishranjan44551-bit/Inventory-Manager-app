-- policies.sql
-- Enable row level security
alter table organizations enable row level security;
alter table organization_users enable row level security;
alter table suppliers enable row level security;
alter table products enable row level security;
alter table product_variants enable row level security;
alter table stock_ledger enable row level security;
alter table purchase_orders enable row level security;
alter table purchase_order_items enable row level security;
alter table menus enable row level security;
alter table menu_items enable row level security;
alter table tables enable row level security;
alter table orders enable row level security;
alter table order_items enable row level security;
alter table payments enable row level security;
alter table reports_cache enable row level security;
alter table audit_logs enable row level security;

-- Helper policy to read own organization memberships
create policy "Users can view their org membership"
on organization_users
for select
using (auth.uid() = user_id);

-- Allow users to insert membership records for themselves (used during onboarding)
create policy "Insert memberships for owners"
on organization_users
for insert
with check (auth.uid() = user_id);

-- Organizations: any member can read their organization
create policy "Organization scoped access"
on organizations
for select
using (
  exists (
    select 1 from organization_users ou
    where ou.org_id = organizations.id
      and ou.user_id = auth.uid()
  )
);

-- General org scoped policy template for tenant tables
create policy "Org members can operate within their org"
on products
for all
using (
  org_id in (
    select org_id from organization_users
    where user_id = auth.uid()
  )
)
with check (
  org_id in (
    select org_id from organization_users
    where user_id = auth.uid()
  )
);

-- Example role-restricted update policy
create policy "Managers and owners can update products"
on products
for update
using (
  exists (
    select 1 from organization_users ou
    where ou.user_id = auth.uid()
      and ou.org_id = products.org_id
      and ou.role in ('owner','manager')
  )
)
with check (
  exists (
    select 1 from organization_users ou
    where ou.user_id = auth.uid()
      and ou.org_id = products.org_id
      and ou.role in ('owner','manager')
  )
);

-- Repeat org scoped policy for other tables as needed (e.g., orders, payments)
