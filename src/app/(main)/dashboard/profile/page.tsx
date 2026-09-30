"use client";

import { useUser } from "@/hooks/use-user";
import { updateProfile, uploadAvatar } from "@/actions/profiles";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Save, Camera, Trophy, Gamepad2, Star, Users } from "lucide-react";
import { useActionState, useState, useEffect, useRef, useTransition } from "react";
import type { ActionResponse } from "@/lib/types";

const initialState: ActionResponse = { success: false };

export default function ProfilePage() {
  const { profile, isLoading, refreshProfile } = useUser();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [avatarUploading, startAvatarUpload] = useTransition();
  const [avatarMsg, setAvatarMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const [state, formAction, isPending] = useActionState(
    async (_prevState: ActionResponse, formData: FormData): Promise<ActionResponse> => {
      const result = await updateProfile(formData);
      if (result.success) {
        await refreshProfile();
      }
      return { success: result.success, error: result.error };
    },
    initialState
  );

  const [username, setUsername] = useState("");
  const [fullName, setFullName] = useState("");
  const [bio, setBio] = useState("");

  useEffect(() => {
    if (profile) {
      setUsername(profile.username ?? "");
      setFullName(profile.full_name ?? "");
      setBio(profile.bio ?? "");
    }
  }, [profile]);

  function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    // Show local preview immediately
    const reader = new FileReader();
    reader.onload = (ev) => setAvatarPreview(ev.target?.result as string);
    reader.readAsDataURL(file);

    // Upload to server
    startAvatarUpload(async () => {
      setAvatarMsg(null);
      const fd = new FormData();
      fd.append("avatar", file);
      const result = await uploadAvatar(fd);
      if (result.success) {
        await refreshProfile();
        setAvatarMsg({ type: "success", text: "Profile picture updated!" });
      } else {
        setAvatarPreview(null); // revert preview
        setAvatarMsg({ type: "error", text: result.error ?? "Upload failed" });
      }
    });
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const displayAvatar = avatarPreview ?? profile?.avatar_url ?? null;
  const initial = profile?.username?.charAt(0).toUpperCase() ?? "?";

  return (
    <div className="space-y-8">
      <div>
        <p className="section-label mb-1.5">Account</p>
        <h1 className="text-3xl font-bold tracking-tight">
          <span className="text-gradient-primary">Your Profile</span>
        </h1>
        <p className="mt-1 text-muted-foreground">
          Manage your public profile information
        </p>
      </div>

      <div className="max-w-2xl space-y-6">
        {/* ── Avatar + Identity ─────────────────────── */}
        <div className="animate-fade-in-up rounded-2xl border border-border/40 bg-card/25 p-6 backdrop-blur-sm">
          <h2 className="mb-5 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            Profile Picture
          </h2>

          <div className="flex items-center gap-6">
            {/* Avatar circle */}
            <div className="relative flex-shrink-0">
              <div className="h-20 w-20 overflow-hidden rounded-2xl bg-gradient-to-br from-primary/80 to-primary/30 ring-4 ring-primary/20 shadow-2xl">
                {displayAvatar ? (
                  <img
                    src={displayAvatar}
                    alt="Profile picture"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-3xl font-bold text-primary-foreground">
                    {initial}
                  </div>
                )}
              </div>

              {/* Upload overlay button */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={avatarUploading}
                className="absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full bg-primary shadow-lg ring-2 ring-background transition-all hover:brightness-110 disabled:opacity-60"
                title="Upload profile picture"
              >
                {avatarUploading ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin text-primary-foreground" />
                ) : (
                  <Camera className="h-3.5 w-3.5 text-primary-foreground" />
                )}
              </button>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                className="hidden"
                onChange={handleAvatarChange}
              />
            </div>

            <div className="flex-1">
              <p className="font-semibold text-foreground">{profile?.username}</p>
              <p className="text-sm text-muted-foreground">
                {profile?.role === "admin" ? "Administrator" : "Player"}
              </p>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={avatarUploading}
                className="mt-2 text-xs font-medium text-primary hover:text-primary/80 transition-colors disabled:opacity-60"
              >
                {avatarUploading ? "Uploading…" : "Change photo"}
              </button>
              <p className="mt-0.5 text-xs text-muted-foreground">
                JPG, PNG, WebP or GIF · max 2 MB
              </p>
            </div>
          </div>

          {/* Avatar feedback */}
          {avatarMsg && (
            <div
              className={`mt-4 rounded-lg border px-4 py-2.5 text-sm ${
                avatarMsg.type === "success"
                  ? "border-success/30 bg-success/10 text-success"
                  : "border-destructive/30 bg-destructive/10 text-destructive"
              }`}
            >
              {avatarMsg.text}
            </div>
          )}
        </div>

        {/* ── Profile Details Form ──────────────────── */}
        <div className="animate-fade-in-up animation-delay-100 rounded-2xl border border-border/40 bg-card/25 p-6 backdrop-blur-sm">
          <h2 className="mb-5 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            Profile Details
          </h2>

          <form action={formAction} className="space-y-5">
            {state.error && (
              <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                {state.error}
              </div>
            )}
            {state.success && (
              <div className="rounded-lg border border-success/30 bg-success/10 px-4 py-3 text-sm text-success">
                ✓ Profile updated successfully!
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                name="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                disabled={isPending}
                placeholder="your_username"
                className="bg-card/40"
              />
              <p className="text-xs text-muted-foreground">
                Only letters, numbers, underscores and hyphens · 3–30 chars
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="full_name">Full Name</Label>
              <Input
                id="full_name"
                name="full_name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Your real name (optional)"
                disabled={isPending}
                className="bg-card/40"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="bio">Bio</Label>
              <textarea
                id="bio"
                name="bio"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Tell others about yourself..."
                rows={3}
                disabled={isPending}
                className="w-full rounded-lg border border-border/50 bg-card/40 px-4 py-2 text-sm placeholder-muted-foreground transition-colors focus:border-primary/50 focus:outline-none focus:ring-1 focus:ring-primary/20 disabled:opacity-50"
                maxLength={500}
              />
              <p className="text-xs text-muted-foreground">
                {bio.length}/500 characters
              </p>
            </div>

            <Button type="submit" disabled={isPending} className="w-full sm:w-auto">
              {isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Saving…
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  Save Changes
                </>
              )}
            </Button>
          </form>
        </div>

        {/* ── Stats Summary ─────────────────────────── */}
        <div className="animate-fade-in-up animation-delay-200 grid grid-cols-2 gap-4 sm:grid-cols-4">
          {[
            { icon: Gamepad2, label: "Games Played", value: profile?.games_played ?? 0 },
            { icon: Trophy,   label: "Games Won",    value: profile?.games_won ?? 0 },
            { icon: Star,     label: "Tournaments",  value: profile?.tournaments_played ?? 0 },
            { icon: Users,    label: "🏆 Won",       value: profile?.tournaments_won ?? 0 },
          ].map(({ icon: Icon, label, value }) => (
            <div
              key={label}
              className="rounded-xl border border-border/40 bg-card/25 p-4 text-center backdrop-blur-sm"
            >
              <Icon className="mx-auto mb-2 h-5 w-5 text-primary" />
              <p className="text-xl font-bold font-mono">{value}</p>
              <p className="mt-0.5 text-xs text-muted-foreground">{label}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
