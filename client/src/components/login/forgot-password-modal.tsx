"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { CheckCircle2, KeyRound, Loader2, Lock, Mail, ShieldCheck, X } from "lucide-react";

import { ApiError, confirmPasswordReset, requestPasswordReset } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const emailSchema = z.object({
  email: z.string().min(1, "Email is required").email("Enter a valid email address"),
});

const resetSchema = z
  .object({
    newPassword: z.string().min(8, "Password must be at least 8 characters"),
    confirm: z.string().min(1, "Please confirm your password"),
  })
  .refine((values) => values.newPassword === values.confirm, {
    message: "Passwords don't match",
    path: ["confirm"],
  });

type EmailValues = z.infer<typeof emailSchema>;
type ResetValues = z.infer<typeof resetSchema>;

export function ForgotPasswordModal({
  open,
  onClose,
  onDone,
  initialEmail = "",
}: {
  open: boolean;
  onClose: () => void;
  onDone: () => void;
  initialEmail?: string;
}) {
  const [mounted, setMounted] = useState(false);
  const [sent, setSent] = useState(false);
  const [devToken, setDevToken] = useState<string | null>(null);
  const [error, setError] = useState("");

  const emailForm = useForm<EmailValues>({
    resolver: zodResolver(emailSchema),
    defaultValues: { email: initialEmail },
  });
  const resetForm = useForm<ResetValues>({
    resolver: zodResolver(resetSchema),
    defaultValues: { newPassword: "", confirm: "" },
  });

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (open) {
      setSent(false);
      setDevToken(null);
      setError("");
      emailForm.reset({ email: initialEmail });
      resetForm.reset({ newPassword: "", confirm: "" });
    }
  }, [open, initialEmail, emailForm, resetForm]);

  async function handleRequestEmail(values: EmailValues) {
    setError("");
    try {
      const res = await requestPasswordReset(values.email.trim());
      // `reset_token` is only present because email delivery isn't wired up
      // yet — in production this would be emailed, never shown here.
      setDevToken(res.reset_token ?? null);
      setSent(true);
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : "Couldn't reach the server. Try again.",
      );
    }
  }

  async function handleReset(values: ResetValues) {
    if (!devToken) return;
    setError("");
    try {
      await confirmPasswordReset(devToken, values.newPassword);
      onDone();
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : "Couldn't reset your password. Try again.",
      );
    }
  }

  if (!mounted || !open) return null;

  return createPortal(
    <div className="fixed inset-0 z-[3000] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-navy/40 backdrop-blur-[1px]" onClick={onClose} aria-hidden />
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
          <KeyRound className="h-5 w-5" />
        </div>

        {!sent ? (
          <>
            <h2 className="mt-3 font-heading text-lg font-bold text-navy">Forgot password?</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Enter the email address associated with your account and we&apos;ll help you reset
              your password.
            </p>

            <form onSubmit={emailForm.handleSubmit(handleRequestEmail)} className="mt-4 flex flex-col gap-3">
              <div className="flex flex-col gap-1.5">
                <label htmlFor="fp-email" className="text-sm font-medium text-foreground">
                  Email address
                </label>
                <div className="relative">
                  <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="fp-email"
                    type="email"
                    autoComplete="email"
                    placeholder="Enter your email address"
                    className="pl-9"
                    {...emailForm.register("email")}
                  />
                </div>
                {emailForm.formState.errors.email && (
                  <span className="text-xs text-destructive">
                    {emailForm.formState.errors.email.message}
                  </span>
                )}
              </div>

              {error && <p className="text-sm text-destructive">{error}</p>}

              <Button
                type="submit"
                disabled={emailForm.formState.isSubmitting}
                className="mt-1 w-full gap-2 rounded-lg bg-navy text-white hover:bg-navy-light disabled:opacity-60"
              >
                {emailForm.formState.isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
                Send reset link
              </Button>
            </form>
          </>
        ) : (
          <>
            <h2 className="mt-3 font-heading text-lg font-bold text-navy">Set a new password</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Choose a new password for <span className="font-medium">{emailForm.getValues("email").trim()}</span>.
            </p>

            {devToken && (
              <p className="mt-3 rounded-md bg-amber-50 px-2 py-1 text-xs text-amber-800">
                Dev token (would be emailed in production):{" "}
                <strong className="break-all font-mono">{devToken}</strong>
              </p>
            )}

            <form onSubmit={resetForm.handleSubmit(handleReset)} className="mt-4 flex flex-col gap-3">
              <div className="flex flex-col gap-1.5">
                <label htmlFor="fp-new" className="text-sm font-medium text-foreground">
                  New password
                </label>
                <div className="relative">
                  <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="fp-new"
                    type="password"
                    autoComplete="new-password"
                    placeholder="At least 8 characters"
                    className="pl-9"
                    {...resetForm.register("newPassword")}
                  />
                </div>
                {resetForm.formState.errors.newPassword && (
                  <span className="text-xs text-destructive">
                    {resetForm.formState.errors.newPassword.message}
                  </span>
                )}
              </div>

              <div className="flex flex-col gap-1.5">
                <label htmlFor="fp-confirm" className="text-sm font-medium text-foreground">
                  Confirm new password
                </label>
                <div className="relative">
                  <ShieldCheck className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="fp-confirm"
                    type="password"
                    autoComplete="new-password"
                    placeholder="Re-enter your password"
                    className="pl-9"
                    {...resetForm.register("confirm")}
                  />
                </div>
                {resetForm.formState.errors.confirm && (
                  <span className="text-xs text-destructive">
                    {resetForm.formState.errors.confirm.message}
                  </span>
                )}
              </div>

              {error && <p className="text-sm text-destructive">{error}</p>}

              <Button
                type="submit"
                disabled={resetForm.formState.isSubmitting}
                className="mt-1 w-full gap-2 rounded-lg bg-navy text-white hover:bg-navy-light disabled:opacity-60"
              >
                {resetForm.formState.isSubmitting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <CheckCircle2 className="h-4 w-4" />
                )}
                Reset password
              </Button>
            </form>
          </>
        )}
      </div>
    </div>,
    document.body,
  );
}
