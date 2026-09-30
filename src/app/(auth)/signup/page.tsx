"use client";

import { useActionState, useState } from "react";
import { Gamepad2, Loader2, Sparkles } from "lucide-react";
import { setUsername } from "@/actions/auth";
import type { ActionResponse } from "@/lib/types";

const initialState: ActionResponse = { success: false };

export default function SetupPage() {
  const [state, formAction, isPending] = useActionState(setUsername, initialState);
  const [value, setValue] = useState("");

  const suggestions = ["ProGamer99", "ShadowStrike", "NeonBlitz", "PixelWolf", "VortexAce", "StarForge"];

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background glow effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-purple-900/10 pointer-events-none" />
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/8 rounded-full blur-3xl pointer-events-none" />

      <div className="relative w-full max-w-md space-y-6 z-10">
        {/* Logo */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/15 border border-primary/30 shadow-lg shadow-primary/20 mx-auto">
            <Gamepad2 className="w-8 h-8 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-white via-primary/90 to-purple-300 bg-clip-text text-transparent">
              Welcome to Arena
            </h1>
            <p className="mt-1.5 text-muted-foreground text-sm">
              Pick a display name to start playing — no sign-up needed
            </p>
          </div>
        </div>

        {/* Card */}
        <div className="rounded-2xl border border-border/50 bg-card/60 backdrop-blur-sm shadow-2xl shadow-black/30 p-6 space-y-5">
          <form action={formAction} className="space-y-4">
            {state.error && (
              <div className="flex items-start gap-2 rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                <span className="mt-0.5">⚠</span>
                {state.error}
              </div>
            )}

            <div className="space-y-2">
              <label htmlFor="username" className="block text-sm font-medium text-foreground/90">
                Your display name
              </label>
              <input
                id="username"
                name="username"
                type="text"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                placeholder="e.g. ProGamer99"
                autoComplete="off"
                autoFocus
                required
                disabled={isPending}
                className="w-full h-11 rounded-xl border border-border/60 bg-muted/30 px-4 text-sm transition-all focus:outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/15 disabled:opacity-50"
              />
              <p className="text-xs text-muted-foreground">2–30 characters · letters, numbers, spaces</p>
            </div>

            {/* Suggestions */}
            <div className="space-y-1.5">
              <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                <Sparkles className="w-3 h-3" />
                Quick picks
              </p>
              <div className="flex flex-wrap gap-2">
                {suggestions.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setValue(s)}
                    className="px-3 py-1 text-xs rounded-lg border border-border/50 bg-muted/20 hover:bg-primary/10 hover:border-primary/40 hover:text-primary transition-all cursor-pointer"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            <button
              type="submit"
              disabled={isPending || value.trim().length < 2}
              className="w-full h-11 rounded-xl bg-primary text-primary-foreground font-semibold text-sm transition-all hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-primary/25 hover:shadow-primary/40 hover:scale-[1.01] active:scale-[0.99]"
            >
              {isPending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Setting up...
                </>
              ) : (
                <>
                  <Gamepad2 className="w-4 h-4" />
                  Enter Arena
                </>
              )}
            </button>
          </form>
        </div>

        <p className="text-center text-xs text-muted-foreground/70">
          Your name is saved in your browser. No account needed.
        </p>
      </div>
    </div>
  );
}
