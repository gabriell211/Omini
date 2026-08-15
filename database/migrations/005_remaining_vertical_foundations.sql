CREATE TABLE pharmacy_lots (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), organization_id uuid NOT NULL REFERENCES organizations(id), product_name varchar(160) NOT NULL,
  batch_number varchar(80) NOT NULL, expires_at date NOT NULL, quantity integer NOT NULL CHECK (quantity >= 0),
  status varchar(16) NOT NULL DEFAULT 'available' CHECK (status IN ('available', 'blocked', 'expired')),
  created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now(), UNIQUE (organization_id, product_name, batch_number)
);
CREATE INDEX pharmacy_lots_organization_expires_idx ON pharmacy_lots (organization_id, expires_at);

CREATE TABLE legal_cases (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), organization_id uuid NOT NULL REFERENCES organizations(id), case_number varchar(80) NOT NULL,
  title varchar(180) NOT NULL, client_name varchar(160) NOT NULL, status varchar(16) NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'paused', 'closed')),
  next_deadline date, created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now(), UNIQUE (organization_id, case_number)
);
CREATE INDEX legal_cases_organization_status_deadline_idx ON legal_cases (organization_id, status, next_deadline);

CREATE TABLE veterinary_patients (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), organization_id uuid NOT NULL REFERENCES organizations(id), name varchar(120) NOT NULL,
  species varchar(40) NOT NULL, breed varchar(80), guardian_name varchar(160) NOT NULL,
  status varchar(16) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'deceased')),
  created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX veterinary_patients_organization_name_idx ON veterinary_patients (organization_id, name);
CREATE TABLE veterinary_appointments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), organization_id uuid NOT NULL REFERENCES organizations(id), patient_id uuid NOT NULL REFERENCES veterinary_patients(id),
  scheduled_at timestamptz NOT NULL, appointment_type varchar(80) NOT NULL, status varchar(16) NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'confirmed', 'completed', 'cancelled')),
  notes text, created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX veterinary_appointments_organization_scheduled_idx ON veterinary_appointments (organization_id, scheduled_at);

CREATE TABLE repair_orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), organization_id uuid NOT NULL REFERENCES organizations(id), order_number varchar(80) NOT NULL,
  customer_name varchar(160) NOT NULL, vehicle varchar(160) NOT NULL, status varchar(16) NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'approved', 'in_progress', 'completed', 'cancelled')),
  estimate_cents integer NOT NULL DEFAULT 0 CHECK (estimate_cents >= 0), created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now(), UNIQUE (organization_id, order_number)
);
CREATE INDEX repair_orders_organization_status_idx ON repair_orders (organization_id, status);

CREATE TABLE building_quotes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), organization_id uuid NOT NULL REFERENCES organizations(id), quote_number varchar(80) NOT NULL,
  customer_name varchar(160) NOT NULL, status varchar(16) NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'approved', 'expired', 'cancelled')),
  total_cents integer NOT NULL DEFAULT 0 CHECK (total_cents >= 0), delivery_date date, created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now(), UNIQUE (organization_id, quote_number)
);
CREATE INDEX building_quotes_organization_status_delivery_idx ON building_quotes (organization_id, status, delivery_date);

CREATE TABLE vehicle_inventory (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), organization_id uuid NOT NULL REFERENCES organizations(id), stock_number varchar(80) NOT NULL,
  make varchar(80) NOT NULL, model varchar(120) NOT NULL, model_year integer NOT NULL CHECK (model_year BETWEEN 1900 AND 2100), price_cents integer NOT NULL CHECK (price_cents >= 0),
  status varchar(16) NOT NULL DEFAULT 'available' CHECK (status IN ('available', 'reserved', 'sold', 'inactive')),
  created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now(), UNIQUE (organization_id, stock_number)
);
CREATE INDEX vehicle_inventory_organization_status_idx ON vehicle_inventory (organization_id, status);
CREATE TABLE vehicle_leads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), organization_id uuid NOT NULL REFERENCES organizations(id), customer_name varchar(160) NOT NULL,
  phone varchar(20), interest varchar(160) NOT NULL, status varchar(16) NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'negotiating', 'won', 'lost')),
  created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX vehicle_leads_organization_status_created_idx ON vehicle_leads (organization_id, status, created_at DESC);

ALTER TABLE pharmacy_lots ENABLE ROW LEVEL SECURITY; ALTER TABLE legal_cases ENABLE ROW LEVEL SECURITY; ALTER TABLE veterinary_patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE veterinary_appointments ENABLE ROW LEVEL SECURITY; ALTER TABLE repair_orders ENABLE ROW LEVEL SECURITY; ALTER TABLE building_quotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE vehicle_inventory ENABLE ROW LEVEL SECURITY; ALTER TABLE vehicle_leads ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON pharmacy_lots USING (organization_id = current_setting('app.current_organization_id', true)::uuid) WITH CHECK (organization_id = current_setting('app.current_organization_id', true)::uuid);
CREATE POLICY tenant_isolation ON legal_cases USING (organization_id = current_setting('app.current_organization_id', true)::uuid) WITH CHECK (organization_id = current_setting('app.current_organization_id', true)::uuid);
CREATE POLICY tenant_isolation ON veterinary_patients USING (organization_id = current_setting('app.current_organization_id', true)::uuid) WITH CHECK (organization_id = current_setting('app.current_organization_id', true)::uuid);
CREATE POLICY tenant_isolation ON veterinary_appointments USING (organization_id = current_setting('app.current_organization_id', true)::uuid) WITH CHECK (organization_id = current_setting('app.current_organization_id', true)::uuid);
CREATE POLICY tenant_isolation ON repair_orders USING (organization_id = current_setting('app.current_organization_id', true)::uuid) WITH CHECK (organization_id = current_setting('app.current_organization_id', true)::uuid);
CREATE POLICY tenant_isolation ON building_quotes USING (organization_id = current_setting('app.current_organization_id', true)::uuid) WITH CHECK (organization_id = current_setting('app.current_organization_id', true)::uuid);
CREATE POLICY tenant_isolation ON vehicle_inventory USING (organization_id = current_setting('app.current_organization_id', true)::uuid) WITH CHECK (organization_id = current_setting('app.current_organization_id', true)::uuid);
CREATE POLICY tenant_isolation ON vehicle_leads USING (organization_id = current_setting('app.current_organization_id', true)::uuid) WITH CHECK (organization_id = current_setting('app.current_organization_id', true)::uuid);
