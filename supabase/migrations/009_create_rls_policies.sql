-- ═══════════════════════════════════════════════════════════
-- Migration 009: Create Row Level Security Policies
-- ═══════════════════════════════════════════════════════════

-- ─── Profiles ────────────────────────────────────────────

CREATE POLICY "Anyone can view profiles"
  ON profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- ─── Tournaments ─────────────────────────────────────────

CREATE POLICY "Anyone can view tournaments"
  ON tournaments FOR SELECT
  USING (true);

CREATE POLICY "Admins can create tournaments"
  ON tournaments FOR INSERT
  WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Admins can update tournaments"
  ON tournaments FOR UPDATE
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- ─── Tournament Participants ─────────────────────────────

CREATE POLICY "Anyone can view participants"
  ON tournament_participants FOR SELECT
  USING (true);

CREATE POLICY "Players can register themselves"
  ON tournament_participants FOR INSERT
  WITH CHECK (auth.uid() = player_id);

CREATE POLICY "Players can withdraw themselves"
  ON tournament_participants FOR UPDATE
  USING (auth.uid() = player_id);

CREATE POLICY "Admins can manage participants"
  ON tournament_participants FOR ALL
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- ─── Rounds ──────────────────────────────────────────────

CREATE POLICY "Anyone can view rounds"
  ON rounds FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage rounds"
  ON rounds FOR ALL
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- ─── Groups ──────────────────────────────────────────────

CREATE POLICY "Anyone can view groups"
  ON groups FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage groups"
  ON groups FOR ALL
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- ─── Group Standings ─────────────────────────────────────

CREATE POLICY "Anyone can view group standings"
  ON group_standings FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage group standings"
  ON group_standings FOR ALL
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- ─── Matches ─────────────────────────────────────────────

CREATE POLICY "Anyone can view matches"
  ON matches FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage matches"
  ON matches FOR ALL
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- ─── Match Players ───────────────────────────────────────

CREATE POLICY "Anyone can view match players"
  ON match_players FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage match players"
  ON match_players FOR ALL
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- ─── Match Events ────────────────────────────────────────

CREATE POLICY "Anyone can view match events"
  ON match_events FOR SELECT
  USING (true);

CREATE POLICY "Admins can insert match events"
  ON match_events FOR INSERT
  WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- ─── Notifications ───────────────────────────────────────

CREATE POLICY "Users can view own notifications"
  ON notifications FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own notifications"
  ON notifications FOR UPDATE
  USING (auth.uid() = user_id);

-- System inserts notifications via service role (bypasses RLS)

-- ─── Push Subscriptions ──────────────────────────────────

CREATE POLICY "Users can view own push subscriptions"
  ON push_subscriptions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own push subscriptions"
  ON push_subscriptions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own push subscriptions"
  ON push_subscriptions FOR DELETE
  USING (auth.uid() = user_id);

-- ─── Audit Logs ──────────────────────────────────────────

CREATE POLICY "Admins can view audit logs"
  ON audit_logs FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- System inserts audit logs via service role (bypasses RLS)
