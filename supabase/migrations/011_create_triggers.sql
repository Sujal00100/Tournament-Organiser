-- ═══════════════════════════════════════════════════════════
-- Migration 011: Create Database Triggers
-- ═══════════════════════════════════════════════════════════

-- ─── Auto-update updated_at on modifications ─────────────

CREATE TRIGGER set_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER set_tournaments_updated_at
  BEFORE UPDATE ON tournaments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER set_matches_updated_at
  BEFORE UPDATE ON matches
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ─── Auto-create profile on user signup ──────────────────

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();
