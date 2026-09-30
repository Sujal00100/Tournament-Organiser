-- ═══════════════════════════════════════════════════════════
-- Migration 012: Storage bucket for avatars + player tournament creation
-- ═══════════════════════════════════════════════════════════

-- ─── Storage: Avatars bucket ─────────────────────────────

INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- Allow authenticated users to upload their own avatar
CREATE POLICY "Users can upload own avatar"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'avatars'
    AND auth.uid() IS NOT NULL
    AND name LIKE 'avatars/' || auth.uid()::text || '%'
  );

-- Allow authenticated users to update (upsert) their own avatar
CREATE POLICY "Users can update own avatar"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'avatars'
    AND auth.uid() IS NOT NULL
    AND name LIKE 'avatars/' || auth.uid()::text || '%'
  );

-- Allow public read access to all avatars
CREATE POLICY "Public can view avatars"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'avatars');

-- ─── Tournaments: Allow authenticated players to create ──

-- Add policy so any authenticated user can create a tournament
CREATE POLICY "Authenticated users can create tournaments"
  ON tournaments FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL AND auth.uid() = created_by);
