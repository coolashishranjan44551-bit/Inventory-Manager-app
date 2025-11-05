-- schema.sql
create extension if not exists "uuid-ossp";
create type user_role as enum ('owner', 'manager', 'staff');

create table organizations (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  gstin text,
  address jsonb,
  currency text default 'INR',
  upi_qr_url text,
  razorpay_key text,
  razorpay_secret text,
  created_at timestamptz default now()
);

create table users (
  id uuid primary key,
  email text unique not null,
  full_name text,
  created_at timestamptz default now()
);

create table organization_users (
  id uuid primary key default uuid_generate_v4(),
  org_id uuid references organizations(id) on delete cascade,
  user_id uuid references users(id) on delete cascade,
  role user_role not null,
  invited_at timestamptz default now(),
  accepted_at timestamptz
);

create table suppliers (
  id uuid primary key default uuid_generate_v4(),
  org_id uuid references organizations(id) on delete cascade,
  name text not null,
  contact jsonb,
  gstin text,
  created_at timestamptz default now()
);

create table products (
  id uuid primary key default uuid_generate_v4(),
  org_id uuid references organizations(id) on delete cascade,
  sku text,
  barcode text,
  name text not null,
  category text,
  unit text default 'pcs',
  price numeric(10,2) not null,
  cost_price numeric(10,2),
  gst_rate numeric(5,2) default 5.0,
  track_stock boolean default true,
  low_stock_threshold numeric(12,2) default 5,
  is_active boolean default true,
  created_at timestamptz default now()
);

create table product_variants (
  id uuid primary key default uuid_generate_v4(),
  product_id uuid references products(id) on delete cascade,
  name text,
  price numeric(10,2),
  cost_price numeric(10,2),
  additional_data jsonb
);

create table stock_ledger (
  id uuid primary key default uuid_generate_v4(),
  org_id uuid not null references organizations(id) on delete cascade,
  product_id uuid not null references products(id) on delete cascade,
  quantity numeric(12,2) not null,
  balance numeric(12,2) not null,
  type text check (type in ('purchase', 'sale', 'adjustment', 'wastage', 'transfer')),
  reference_id uuid,
  note text,
  created_by uuid references users(id),
  created_at timestamptz default now()
);

create table purchase_orders (
  id uuid primary key default uuid_generate_v4(),
  org_id uuid references organizations(id) on delete cascade,
  supplier_id uuid references suppliers(id),
  status text check (status in ('draft', 'ordered', 'received', 'cancelled')) default 'draft',
  expected_date date,
  total_amount numeric(12,2),
  gst_amount numeric(12,2),
  created_by uuid references users(id),
  created_at timestamptz default now()
);

create table purchase_order_items (
  id uuid primary key default uuid_generate_v4(),
  purchase_order_id uuid references purchase_orders(id) on delete cascade,
  product_id uuid references products(id),
  quantity numeric(12,2),
  cost_price numeric(10,2),
  gst_rate numeric(5,2),
  line_total numeric(12,2)
);

create table menus (
  id uuid primary key default uuid_generate_v4(),
  org_id uuid references organizations(id) on delete cascade,
  name text,
  is_active boolean default true,
  created_at timestamptz default now()
);

create table menu_items (
  id uuid primary key default uuid_generate_v4(),
  menu_id uuid references menus(id) on delete cascade,
  product_id uuid references products(id),
  display_name text,
  sort_order int,
  is_available boolean default true
);

create table tables (
  id uuid primary key default uuid_generate_v4(),
  org_id uuid references organizations(id) on delete cascade,
  name text,
  capacity int,
  is_active boolean default true
);

create table orders (
  id uuid primary key default uuid_generate_v4(),
  org_id uuid references organizations(id) on delete cascade,
  table_id uuid references tables(id),
  order_number serial,
  order_type text check (order_type in ('dine-in','takeaway','delivery')) default 'dine-in',
  status text check (status in ('open','paid','cancelled','void')) default 'open',
  subtotal numeric(12,2),
  gst_amount numeric(12,2),
  discount numeric(12,2) default 0,
  service_charge numeric(12,2) default 0,
  total_amount numeric(12,2),
  payment_mode text,
  payment_reference text,
  kot_notes text,
  created_by uuid references users(id),
  closed_by uuid references users(id),
  opened_at timestamptz default now(),
  closed_at timestamptz
);

create table order_items (
  id uuid primary key default uuid_generate_v4(),
  order_id uuid references orders(id) on delete cascade,
  product_id uuid references products(id),
  variant_id uuid references product_variants(id),
  quantity numeric(10,2),
  price numeric(10,2),
  gst_rate numeric(5,2),
  notes text
);

create table payments (
  id uuid primary key default uuid_generate_v4(),
  org_id uuid references organizations(id) on delete cascade,
  order_id uuid references orders(id),
  amount numeric(12,2),
  method text check (method in ('cash','card','upi','wallet','razorpay')),
  reference text,
  received_at timestamptz default now(),
  received_by uuid references users(id)
);

create table reports_cache (
  id uuid primary key default uuid_generate_v4(),
  org_id uuid references organizations(id) on delete cascade,
  report_date date,
  type text,
  payload jsonb,
  generated_at timestamptz default now()
);

create table audit_logs (
  id uuid primary key default uuid_generate_v4(),
  org_id uuid references organizations(id) on delete cascade,
  user_id uuid references users(id),
  action text,
  entity text,
  entity_id uuid,
  metadata jsonb,
  created_at timestamptz default now()
);
