"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  CheckCircle2,
  Eye,
  EyeOff,
  Hotel,
  Loader2,
  Lock,
  Mail,
  ShieldCheck,
  Sparkles,
  TrendingUp,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ApiError, api, login } from "@/lib/api";
import { isAuthenticated } from "@/lib/auth";

const features = [
  {
    icon: TrendingUp,
    title: "Live business overview",
    description: "Bookings, occupancy and revenue at a glance.",
  },
  {
    icon: ShieldCheck,
    title: "Full control",
    description: "Properties, guests, CMS, blog and pricing in one place.",
  },
  {
    icon: Sparkles,
    title: "Smart integrations",
    description: "Ferries, flights and transfers powered by partner APIs.",
  },
];

export default function LoginPage() {
  const router = useRouter();
  const [checking, setChecking] = useState(true);
  const [email, setEmail] = useState("admin@royalvacation.com");
  const [password, setPassword] = useState("admin12345");
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(true);
  const [error, setError] = useState<string>();
  const [loading, setLoading] = useState(false);

  const [forgotMode, setForgotMode] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotMessage, setForgotMessage] = useState<string>();
  const [forgotLoading, setForgotLoading] = useState(false);

  useEffect(() => {
    if (isAuthenticated()) {
      router.replace("/");
    } else {
      setChecking(false);
    }
  }, [router]);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(undefined);
    setLoading(true);
    try {
      await login(email, password);
      router.push("/");
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : "Couldn't reach the server. Please try again."
      );
      setLoading(false);
    }
  }

  async function onForgotSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setForgotMessage(undefined);
    setForgotLoading(true);
    try {
      const res = await api.auth.resetPassword({ email: forgotEmail });
      // `reset_token` is only present because email delivery isn't wired up
      // yet — in production this would be emailed, never shown here.
      setForgotMessage(
        res.reset_token
          ? `${res.message} Dev token (would normally be emailed): ${res.reset_token}`
          : res.message
      );
    } catch (err) {
      setForgotMessage(
        err instanceof ApiError
          ? err.message
          : "Couldn't reach the server. Please try again."
      );
    } finally {
      setForgotLoading(false);
    }
  }

  if (checking) return null;

  return (
    <div className="flex min-h-screen">
      <aside className="relative hidden w-1/2 flex-col justify-between overflow-hidden bg-navy p-10 lg:flex">
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.08]"
          style={{
            backgroundImage:
              "radial-gradient(circle at 1px 1px, #f6c453 1px, transparent 0)",
            backgroundSize: "28px 28px",
          }}
        />
        <div className="absolute -top-24 -right-24 size-72 rounded-full bg-gold/10 blur-3xl" />
        <div className="absolute -bottom-32 -left-20 size-80 rounded-full bg-gold/5 blur-3xl" />

        <div className="relative flex items-center gap-3">
          <span className="flex size-11 items-center justify-center rounded-xl bg-gold text-navy">
            <Hotel className="size-6" />
          </span>
          <div>
            <p className="text-base font-semibold text-white">Royal Vacation</p>
            <p className="text-xs text-white/60">Admin Panel</p>
          </div>
        </div>

        <div className="relative space-y-8">
          <div>
            <h1 className="text-3xl leading-tight font-semibold text-white">
              Run your entire vacation business from one place.
            </h1>
            <p className="mt-3 max-w-md text-sm leading-relaxed text-white/60">
              Manage properties, bookings, content and partner integrations
              with a fast, modern admin experience.
            </p>
          </div>

          <div className="space-y-4">
            {features.map(({ icon: Icon, title, description }) => (
              <div key={title} className="flex items-start gap-3">
                <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg bg-white/10 text-gold">
                  <Icon className="size-4" />
                </span>
                <div>
                  <p className="text-sm font-medium text-white">{title}</p>
                  <p className="text-xs text-white/60">{description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <p className="relative text-xs text-white/40">
          © {new Date().getFullYear()} Royal Vacation. All rights reserved.
        </p>
      </aside>

      <main className="flex w-full flex-1 items-center justify-center bg-muted/40 p-6 lg:w-1/2">
        <div className="w-full max-w-sm space-y-6">
          <div className="flex flex-col items-center gap-2 text-center lg:hidden">
            <span className="flex size-12 items-center justify-center rounded-xl bg-navy text-gold">
              <Hotel className="size-6" />
            </span>
            <h1 className="text-xl font-semibold text-navy">Royal Vacation</h1>
          </div>

          {forgotMode ? (
            <>
              <div className="space-y-1">
                <h2 className="text-2xl font-semibold text-navy">
                  Reset your password
                </h2>
                <p className="text-sm text-muted-foreground">
                  Enter your email and we&apos;ll send you a reset link.
                </p>
              </div>

              <form
                onSubmit={onForgotSubmit}
                className="space-y-4 rounded-xl border border-border bg-white p-6 shadow-sm"
              >
                <div className="space-y-2">
                  <label
                    htmlFor="forgot-email"
                    className="flex items-center gap-1.5 text-xs font-semibold text-foreground"
                  >
                    <Mail className="size-3.5 text-muted-foreground" />
                    Email
                  </label>
                  <Input
                    id="forgot-email"
                    type="email"
                    autoComplete="email"
                    placeholder="admin@royalvacation.com"
                    value={forgotEmail}
                    onChange={(event) => setForgotEmail(event.target.value)}
                    required
                  />
                </div>

                {forgotMessage && (
                  <p className="rounded-lg bg-muted/50 p-2.5 text-xs break-words text-foreground/80">
                    {forgotMessage}
                  </p>
                )}

                <Button type="submit" className="w-full" disabled={forgotLoading}>
                  {forgotLoading ? (
                    <Loader2 data-icon="inline-start" className="animate-spin" />
                  ) : (
                    "Send reset link"
                  )}
                </Button>

                <button
                  type="button"
                  onClick={() => {
                    setForgotMode(false);
                    setForgotMessage(undefined);
                  }}
                  className="w-full text-center text-xs font-medium text-navy transition-colors hover:text-navy/70"
                >
                  Back to sign in
                </button>
              </form>
            </>
          ) : (
            <>
              <div className="space-y-1">
                <h2 className="text-2xl font-semibold text-navy">Welcome back</h2>
                <p className="text-sm text-muted-foreground">
                  Sign in to the admin panel to continue.
                </p>
              </div>

              <form
                onSubmit={onSubmit}
                className="space-y-4 rounded-xl border border-border bg-white p-6 shadow-sm"
              >
                <div className="space-y-2">
                  <label
                    htmlFor="email"
                    className="flex items-center gap-1.5 text-xs font-semibold text-foreground"
                  >
                    <Mail className="size-3.5 text-muted-foreground" />
                    Email
                  </label>
                  <Input
                    id="email"
                    type="email"
                    autoComplete="email"
                    placeholder="admin@royalvacation.com"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label
                      htmlFor="password"
                      className="flex items-center gap-1.5 text-xs font-semibold text-foreground"
                    >
                      <Lock className="size-3.5 text-muted-foreground" />
                      Password
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        setForgotMode(true);
                        setForgotEmail(email);
                      }}
                      className="text-xs font-medium text-navy transition-colors hover:text-navy/70"
                    >
                      Forgot password?
                    </button>
                  </div>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      autoComplete="current-password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(event) => setPassword(event.target.value)}
                      className="pr-10"
                      required
                    />
                    <button
                      type="button"
                      aria-label={showPassword ? "Hide password" : "Show password"}
                      onClick={() => setShowPassword((value) => !value)}
                      className="absolute top-1/2 right-2.5 -translate-y-1/2 text-muted-foreground transition-colors outline-none hover:text-foreground"
                    >
                      {showPassword ? (
                        <EyeOff className="size-4" />
                      ) : (
                        <Eye className="size-4" />
                      )}
                    </button>
                  </div>
                </div>

                <label className="flex items-center gap-2 text-sm text-muted-foreground">
                  <input
                    type="checkbox"
                    checked={remember}
                    onChange={(event) => setRemember(event.target.checked)}
                    className="size-4 rounded border-input accent-navy"
                  />
                  Remember me
                </label>

                {error && (
                  <p className="flex items-center gap-2 rounded-lg bg-destructive/10 p-2.5 text-xs text-destructive">
                    <ShieldCheck className="size-4 shrink-0" />
                    {error}
                  </p>
                )}

                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? (
                    <Loader2 data-icon="inline-start" className="animate-spin" />
                  ) : (
                    "Sign in"
                  )}
                  {!loading && <ArrowRight data-icon="inline-end" />}
                </Button>

                <div className="rounded-lg bg-muted/50 p-3 text-center">
                  <p className="text-xs text-muted-foreground">
                    Demo credentials — prefilled below.
                  </p>
                  <p className="mt-0.5 font-mono text-[11px] text-foreground/70">
                    admin@royalvacation.com / admin12345
                  </p>
                </div>
              </form>
            </>
          )}

          <p className="flex items-center justify-center gap-1.5 text-center text-xs text-muted-foreground">
            <CheckCircle2 className="size-3.5 text-emerald-500" />
            Secure session · protected admin area
          </p>
        </div>
      </main>
    </div>
  );
}
