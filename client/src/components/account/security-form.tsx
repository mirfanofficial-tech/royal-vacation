"use client";

import { useState } from "react";
import { BadgeCheck, Loader2 } from "lucide-react";

import { ApiError, api } from "@/lib/api";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const labelClass = "mb-1.5 block text-sm font-medium text-foreground";

export function SecurityForm() {
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  const mismatch = confirm.length > 0 && confirm !== next;
  const tooShort = next.length > 0 && next.length < 8;
  const canSubmit = current.length > 0 && next.length >= 8 && confirm === next && !busy;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;
    setBusy(true);
    setError("");
    try {
      await api.profile.changePassword({ current_password: current, new_password: next });
      setDone(true);
      setCurrent("");
      setNext("");
      setConfirm("");
      setTimeout(() => setDone(false), 3000);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Couldn't update your password.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-2xl border border-border bg-white p-6 shadow-sm">
      <h2 className="text-base font-semibold text-navy">Change password</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        Use at least 8 characters. If you signed up with a one-time code, request a reset from the
        sign-in page to set your first password.
      </p>

      <div className="mt-5 grid grid-cols-1 gap-4">
        <div>
          <label className={labelClass} htmlFor="current">Current password</label>
          <Input
            id="current"
            type="password"
            autoComplete="current-password"
            value={current}
            onChange={(e) => setCurrent(e.target.value)}
          />
        </div>
        <div>
          <label className={labelClass} htmlFor="next">New password</label>
          <Input
            id="next"
            type="password"
            autoComplete="new-password"
            value={next}
            onChange={(e) => setNext(e.target.value)}
          />
          {tooShort && (
            <span className="mt-1 block text-xs text-destructive">
              Must be at least 8 characters
            </span>
          )}
        </div>
        <div>
          <label className={labelClass} htmlFor="confirm">Confirm new password</label>
          <Input
            id="confirm"
            type="password"
            autoComplete="new-password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
          />
          {mismatch && (
            <span className="mt-1 block text-xs text-destructive">Passwords don&apos;t match</span>
          )}
        </div>
      </div>

      {error && <p className="mt-4 text-sm text-destructive">{error}</p>}

      <div className="mt-6 flex items-center gap-3">
        <Button
          type="submit"
          disabled={!canSubmit}
          className="gap-2 rounded-lg bg-navy text-white hover:bg-navy-light disabled:opacity-60"
        >
          {busy && <Loader2 className="h-4 w-4 animate-spin" />}
          Update password
        </Button>
        {done && (
          <span className="flex items-center gap-1 text-sm text-rating">
            <BadgeCheck className="h-4 w-4" />
            Password updated
          </span>
        )}
      </div>
    </form>
  );
}
