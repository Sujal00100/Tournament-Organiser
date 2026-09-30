-- ═══════════════════════════════════════════════════════════
-- Migration 008: Create Audit Logs Table
-- ═══════════════════════════════════════════════════════════

CREATE TABLE audit_logs (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id    UUID REFERENCES profiles(id),
  action      VARCHAR(50) NOT NULL,
  entity_type VARCHAR(30) NOT NULL,
  entity_id   UUID NOT NULL,
  old_data    JSONB,
  new_data    JSONB,
  ip_address  INET,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX idx_audit_actor ON audit_logs (actor_id);
CREATE INDEX idx_audit_entity ON audit_logs (entity_type, entity_id);
CREATE INDEX idx_audit_action ON audit_logs (action);
CREATE INDEX idx_audit_created ON audit_logs (created_at DESC);

ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
