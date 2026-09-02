"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Loader2, Mail, X } from "lucide-react";

import { ApiError, verifyOtp } from "@/lib/api";
import { Button } from "@/components/ui/button";

export function OtpModal({
  open,
  email,
  devCode,
  onVerified,
  onResend,
  onClose,
}: {
  open: boolean;
  email: string;
  devCode?: string | null;
  onVerified: () => void;
  onResend: () => Promise<string | null | undefined>;
  onClose: () => void;
}) {
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [cooldown, setCooldown] = useState(0);
  const [localDevCode, setLocalDevCode] = useState<string | null | undefined>(devCode);
  const [mounted, setMounted] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (open) {
      setCode("");
      setError("");
      setLocalDevCode(devCode);
      setCooldown(30);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open, devCode]);

  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setInterval(() => setCooldown((c) => c - 1), 1000);
    return () => clearInterval(t);
  }, [cooldown]);

  async function handleVerify() {
    if (code.length < 4 || busy) return;
    setBusy(true);
    setError("");
    try {
      await verifyOtp({ email, code: code.trim() });
      onVerified();
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : "Couldn't verify that code. Try again.",
      );
    } finally {
      setBusy(false);
    }
  }

  async function handleResend() {
    if (cooldown > 0 || busy) return;
    setError("");
    setCode("");
    try {
      const next = await onResend();
      setLocalDevCode(next);
      setCooldown(30);
    } catch {
      setError("Couldn't resend the code. Try again in a moment.");
    }
  }

  if (!mounted || !open) return null;

  return createPortal(
    <div className="fixed inset-0 z-[3000] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-navy/40 backdrop-blur-[1px]"
        onClick={onClose}
        aria-hidden
      />
      <div className="relative w-full max-w-sm rounded-2xl border border-border bg-white p-6 shadow-xl">
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute right-4 top-4 text-muted-foreground hover:text-foreground"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-navy/5 text-navy">
          <Mail className="h-5 w-5" />
        </div>
        <h2 className="mt-3 font-heading text-lg font-bold text-navy">Verify your email</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Enter the 6-digit code we sent to <span className="font-medium">{email}</span>.
        </p>

        <input
          ref={inputRef}
          value={code}
          onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
          onKeyDown={(e) => e.key === "Enter" && handleVerify()}
          inputMode="numeric"
          autoComplete="one-time-code"
          placeholder="••••••"
          className="mt-4 w-full rounded-lg border border-input bg-white px-3 py-2.5 text-center text-2xl tracking-[0.5em] outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
        />

        {localDevCode && (
          <p className="mt-2 rounded-md bg-amber-50 px-2 py-1 text-center text-xs text-amber-800">
            Dev code (email not configured): <strong>{localDevCode}</strong>
          </p>
        )}
        {error && <p className="mt-2 text-sm text-destructive">{error}</p>}

        <Button
          onClick={handleVerify}
          disabled={code.length < 4 || busy}
          className="mt-4 w-full gap-2 rounded-lg bg-navy text-white hover:bg-navy-light disabled:opacity-60"
        >
          {busy && <Loader2 className="h-4 w-4 animate-spin" />}
          Verify &amp; continue
        </Button>

        <button
          type="button"
          onClick={handleResend}
          disabled={cooldown > 0 || busy}
          className="mt-3 w-full text-center text-sm font-medium text-navy hover:underline disabled:text-muted-foreground disabled:no-underline"
        >
          {cooldown > 0 ? `Resend code in ${cooldown}s` : "Resend code"}
        </button>
      </div>
    </div>,
    document.body,
  );
}
