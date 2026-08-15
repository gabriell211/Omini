CREATE TABLE checkout_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id),
  provider varchar(40) NOT NULL,
  order_nsu varchar(191) NOT NULL UNIQUE,
  provider_invoice_slug varchar(191) UNIQUE,
  provider_transaction_nsu varchar(191) UNIQUE,
  amount_cents integer NOT NULL CHECK (amount_cents > 0),
  status varchar(16) NOT NULL DEFAULT 'created' CHECK (status IN ('created', 'paid', 'failed', 'expired')),
  checkout_url text,
  provider_payload jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  paid_at timestamptz
);
CREATE INDEX checkout_sessions_organization_status_created_idx ON checkout_sessions (organization_id, status, created_at DESC);

-- This is a platform-owned payment-correlation table. It deliberately has no
-- tenant-facing database role because the provider webhook must resolve an
-- opaque order ID before the tenant is known. Tenant users never query it.
