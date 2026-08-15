-- Platform billing is centrally managed; operational data remains tenant-isolated.
CREATE TABLE subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL UNIQUE REFERENCES organizations(id),
  status varchar(16) NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'active', 'past_due', 'cancelled')),
  provider varchar(40) NOT NULL,
  provider_customer_id varchar(191) UNIQUE,
  provider_subscription_id varchar(191) UNIQUE,
  current_period_end timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE billing_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid REFERENCES organizations(id),
  provider varchar(40) NOT NULL,
  provider_event_id varchar(191) NOT NULL UNIQUE,
  event_type varchar(100) NOT NULL,
  payload jsonb NOT NULL,
  processed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX billing_events_organization_created_at_idx ON billing_events (organization_id, created_at DESC);

CREATE TABLE restaurant_tables (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id),
  name varchar(80) NOT NULL,
  capacity integer NOT NULL CHECK (capacity > 0),
  status varchar(16) NOT NULL DEFAULT 'available' CHECK (status IN ('available', 'occupied', 'reserved', 'disabled')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (organization_id, name)
);
CREATE INDEX restaurant_tables_organization_status_idx ON restaurant_tables (organization_id, status);

CREATE TABLE restaurant_orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id),
  table_id uuid REFERENCES restaurant_tables(id) ON DELETE SET NULL,
  status varchar(16) NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'sent', 'preparing', 'ready', 'closed', 'cancelled')),
  subtotal_cents integer NOT NULL DEFAULT 0 CHECK (subtotal_cents >= 0),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX restaurant_orders_organization_status_created_idx ON restaurant_orders (organization_id, status, created_at DESC);

CREATE TABLE restaurant_order_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES restaurant_orders(id) ON DELETE CASCADE,
  name varchar(160) NOT NULL,
  quantity integer NOT NULL CHECK (quantity > 0),
  unit_cents integer NOT NULL CHECK (unit_cents >= 0),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id),
  sku varchar(80) NOT NULL,
  barcode varchar(32),
  name varchar(160) NOT NULL,
  unit varchar(8) NOT NULL DEFAULT 'UN',
  sale_price_cents integer NOT NULL CHECK (sale_price_cents >= 0),
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (organization_id, sku)
);
CREATE INDEX products_organization_barcode_idx ON products (organization_id, barcode);

CREATE TABLE inventory_balances (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id),
  product_id uuid NOT NULL REFERENCES products(id),
  quantity integer NOT NULL DEFAULT 0 CHECK (quantity >= 0),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (organization_id, product_id)
);
CREATE INDEX inventory_balances_organization_quantity_idx ON inventory_balances (organization_id, quantity);

CREATE TABLE supermarket_sales (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id),
  status varchar(16) NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'paid', 'cancelled')),
  total_cents integer NOT NULL DEFAULT 0 CHECK (total_cents >= 0),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX supermarket_sales_organization_status_created_idx ON supermarket_sales (organization_id, status, created_at DESC);

CREATE TABLE supermarket_sale_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sale_id uuid NOT NULL REFERENCES supermarket_sales(id) ON DELETE CASCADE,
  product_id uuid NOT NULL REFERENCES products(id),
  quantity integer NOT NULL CHECK (quantity > 0),
  unit_cents integer NOT NULL CHECK (unit_cents >= 0),
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE restaurant_tables ENABLE ROW LEVEL SECURITY;
ALTER TABLE restaurant_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_balances ENABLE ROW LEVEL SECURITY;
ALTER TABLE supermarket_sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE restaurant_order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE supermarket_sale_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY tenant_isolation ON restaurant_tables
  USING (organization_id = current_setting('app.current_organization_id', true)::uuid)
  WITH CHECK (organization_id = current_setting('app.current_organization_id', true)::uuid);
CREATE POLICY tenant_isolation ON restaurant_orders
  USING (organization_id = current_setting('app.current_organization_id', true)::uuid)
  WITH CHECK (organization_id = current_setting('app.current_organization_id', true)::uuid);
CREATE POLICY tenant_isolation ON products
  USING (organization_id = current_setting('app.current_organization_id', true)::uuid)
  WITH CHECK (organization_id = current_setting('app.current_organization_id', true)::uuid);
CREATE POLICY tenant_isolation ON inventory_balances
  USING (organization_id = current_setting('app.current_organization_id', true)::uuid)
  WITH CHECK (organization_id = current_setting('app.current_organization_id', true)::uuid);
CREATE POLICY tenant_isolation ON supermarket_sales
  USING (organization_id = current_setting('app.current_organization_id', true)::uuid)
  WITH CHECK (organization_id = current_setting('app.current_organization_id', true)::uuid);
CREATE POLICY tenant_isolation_by_order ON restaurant_order_items
  USING (EXISTS (
    SELECT 1 FROM restaurant_orders
    WHERE restaurant_orders.id = restaurant_order_items.order_id
      AND restaurant_orders.organization_id = current_setting('app.current_organization_id', true)::uuid
  ));
CREATE POLICY tenant_isolation_by_sale ON supermarket_sale_items
  USING (EXISTS (
    SELECT 1 FROM supermarket_sales
    WHERE supermarket_sales.id = supermarket_sale_items.sale_id
      AND supermarket_sales.organization_id = current_setting('app.current_organization_id', true)::uuid
  ));
