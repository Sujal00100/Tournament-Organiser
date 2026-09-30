-- ═══════════════════════════════════════════════════════════
-- Migration 010: Create Database Functions
-- ═══════════════════════════════════════════════════════════

-- ─── Auto-update updated_at timestamp ────────────────────

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ─── Handle new user signup → auto-create profile ────────

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, username, role)
  VALUES (
    NEW.id,
    COALESCE(
      NEW.raw_user_meta_data->>'username',
      'user_' || substr(NEW.id::text, 1, 8)
    ),
    'player'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
