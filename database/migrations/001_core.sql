-- Omni Platform: shared kernel only. Vertical tables live in their own migrations.
-- PostgreSQL Row-Level Security is the final database-level tenant boundary.
CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TYPE organization_status AS ENUM ('trial', 'active', 'suspended', 'cancelled');
CREATE TYPE membership_role AS ENUM ('owner', 'admin', 'manager', 'operator', 'viewer');

CREATE TABLE organizations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  legal_name text NOT NULL,
  trade_name text NOT NULL,
  tax_id varchar(18) NOT NULL UNIQUE,
  status organization_status NOT NULL DEFAULT 'trial',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz
);

CREATE TABLE organization_verticals (
  organization_id uuid NOT NULL REFERENCES organizations(id),
  vertical varchar(32) NOT NULL,
  enabled_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (organization_id, vertical),
  CONSTRAINT organization_verticals_vertical_check CHECK (
    vertical IN ('restaurant', 'supermarket', 'pharmacy', 'legal', 'beauty_wellness', 'field_services', 'retail_commerce', 'franchise_hq')
  )
);

CREATE TABLE memberships (
  organization_id uuid NOT NULL REFERENCES organizations(id),
  identity_subject text NOT NULL,
  role membership_role NOT NULL,
  permissions jsonb NOT NULL DEFAULT '[]'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  revoked_at timestamptz,
  PRIMARY KEY (organization_id, identity_subject)
);

CREATE TABLE audit_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id),
  actor_subject text,
  correlation_id text NOT NULL,
  action varchar(120) NOT NULL,
  aggregate_type varchar(100) NOT NULL,
  aggregate_id text NOT NULL,
  before_data jsonb,
  after_data jsonb,
  ip inet,
  user_agent text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX audit_events_organization_created_at_idx
  ON audit_events (organization_id, created_at DESC);

-- Connection pools must run SET LOCAL app.current_organization_id inside every
-- transaction. Application roles must never be granted BYPASSRLS.
ALTER TABLE organization_verticals ENABLE ROW LEVEL SECURITY;
ALTER TABLE memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY tenant_isolation ON organization_verticals
  USING (organization_id = current_setting('app.current_organization_id', true)::uuid)
  WITH CHECK (organization_id = current_setting('app.current_organization_id', true)::uuid);

CREATE POLICY tenant_isolation ON memberships
  USING (organization_id = current_setting('app.current_organization_id', true)::uuid)
  WITH CHECK (organization_id = current_setting('app.current_organization_id', true)::uuid);

CREATE POLICY tenant_isolation ON audit_events
  USING (organization_id = current_setting('app.current_organization_id', true)::uuid)
  WITH CHECK (organization_id = current_setting('app.current_organization_id', true)::uuid);
