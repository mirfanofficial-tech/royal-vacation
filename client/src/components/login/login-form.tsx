"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Apple, Mail, Lock, Eye, EyeOff, ArrowRight, ShieldCheck } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { GoogleSignInButton } from "@/components/auth/google-sign-in-button";
import { FacebookSignInButton } from "@/components/auth/facebook-sign-in-button";
import { ApiError, login, requestOtp } from "@/lib/api";
import { isAuthenticated } from "@/lib/auth";
import { OtpModal } from "@/components/checkout/otp-modal";
import { ForgotPasswordModal } from "@/components/login/forgot-password-modal";

const loginSchema = z.object({
  email: z.string().min(1, "Email is required").email("Enter a valid email address"),
  password: z.string().min(1, "Password is required"),
  rememberMe: z.boolean(),
});

type LoginValues = z.infer<typeof loginSchema>;

export function LoginForm() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [otpOpen, setOtpOpen] = useState(false);
  const [otpEmail, setOtpEmail] = useState("");
  const [otpDevCode, setOtpDevCode] = useState<string | null>(null);
  const [otpBusy, setOtpBusy] = useState(false);
  const [forgotOpen, setForgotOpen] = useState(false);

  useEffect(() => {
    if (isAuthenticated()) router.replace("/");
  }, [router]);

  const {
    register,
    control,
    watch,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "", rememberMe: true },
  });

  async function handleCodeSignIn() {
    const email = watch("email").trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setSubmitError("Enter your email address first.");
      return;
    }
    setSubmitError(null);
    setOtpBusy(true);
    try {
      const r = await requestOtp({ email });
      setOtpEmail(email);
      setOtpDevCode(r.dev_code ?? null);
      setOtpOpen(true);
    } catch (error) {
      setSubmitError(
        error instanceof ApiError ? error.message : "Couldn't send a code. Try again.",
      );
    } finally {
      setOtpBusy(false);
    }
  }

  const onSubmit = handleSubmit(async (values) => {
    setSubmitError(null);
    try {
      await login(values.email, values.password);
      router.push("/");
    } catch (error) {
      setSubmitError(
        error instanceof ApiError
          ? error.message
          : "Couldn't reach the server. Please try again."
      );
    }
  });

  return (
    <div className="flex flex-col gap-6 p-6 sm:p-10">
      <div>
        <h1 className="font-heading text-3xl font-bold text-navy">Welcome back 👋</h1>
        <p className="mt-2 text-sm text-muted-foreground">Sign in to your account</p>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <GoogleSignInButton
          onSuccess={() => router.push("/")}
          onError={(message) => setSubmitError(message)}
        />
        <FacebookSignInButton
          onSuccess={() => router.push("/")}
          onError={(message) => setSubmitError(message)}
        />
        <button
          type="button"
          aria-label="Continue with Apple"
          className="flex h-12 items-center justify-center rounded-lg border border-border py-2.5 text-foreground hover:border-navy hover:bg-muted"
        >
          <Apple className="h-5 w-5" />
        </button>
      </div>

      <div className="flex items-center gap-3">
        <div className="h-px flex-1 bg-border" />
        <span className="text-xs text-muted-foreground">or</span>
        <div className="h-px flex-1 bg-border" />
      </div>

      <form onSubmit={onSubmit} className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="email" className="text-sm font-medium text-foreground">
            Email address
          </label>
          <div className="relative">
            <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="email"
              type="email"
              autoComplete="off"
              {...register("email")}
              placeholder="Enter your email address"
              className="pl-9"
            />
          </div>
          {errors.email && (
            <span className="text-xs text-destructive">{errors.email.message}</span>
          )}
        </div>

        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between">
            <label htmlFor="password" className="text-sm font-medium text-foreground">
              Password
            </label>
            <button
              type="button"
              onClick={() => setForgotOpen(true)}
              className="text-xs font-semibold text-gold hover:underline"
            >
              Forgot password?
            </button>
          </div>
          <div className="relative">
            <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              {...register("password")}
              placeholder="Enter your password"
              className="pl-9 pr-9"
            />
            <button
              type="button"
              aria-label={showPassword ? "Hide password" : "Show password"}
              onClick={() => setShowPassword((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {errors.password && (
            <span className="text-xs text-destructive">{errors.password.message}</span>
          )}
        </div>

        <label className="flex cursor-pointer items-center gap-2 text-sm text-foreground">
          <Controller
            control={control}
            name="rememberMe"
            render={({ field }) => (
              <Checkbox
                checked={field.value}
                onCheckedChange={(checked) => field.onChange(checked === true)}
              />
            )}
          />
          Remember me
        </label>

        {submitError && (
          <p className="text-center text-sm font-medium text-destructive">{submitError}</p>
        )}

        <Button
          type="submit"
          disabled={isSubmitting}
          className="w-full gap-2 rounded-lg bg-navy text-white hover:bg-navy-light disabled:opacity-60"
        >
          <Lock className="h-4 w-4" />
          {isSubmitting ? "Signing in…" : "Sign in to your account"}
          {!isSubmitting && <ArrowRight className="h-4 w-4" />}
        </Button>

        <button
          type="button"
          onClick={handleCodeSignIn}
          disabled={otpBusy}
          className="text-center text-sm font-medium text-navy hover:underline disabled:text-muted-foreground"
        >
          {otpBusy ? "Sending code…" : "Email me a sign-in code instead"}
        </button>

        <div className="flex items-start gap-3 rounded-lg bg-navy/5 p-4">
          <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-navy" />
          <div>
            <p className="text-sm font-semibold text-navy">Your security is our priority</p>
            <p className="text-xs text-muted-foreground">
              We use industry-leading encryption to keep your data safe and secure.
            </p>
          </div>
        </div>

        <p className="text-center text-sm text-muted-foreground">
          Don&apos;t have an account?{" "}
          <Link href="/register" className="font-semibold text-gold hover:underline">
            Register
          </Link>
        </p>
      </form>

      <OtpModal
        open={otpOpen}
        email={otpEmail}
        devCode={otpDevCode}
        onClose={() => setOtpOpen(false)}
        onResend={async () => {
          const r = await requestOtp({ email: otpEmail });
          return r.dev_code ?? null;
        }}
        onVerified={() => {
          setOtpOpen(false);
          router.push("/account");
        }}
      />

      <ForgotPasswordModal
        open={forgotOpen}
        initialEmail={watch("email")}
        onClose={() => setForgotOpen(false)}
        onDone={() => {
          setForgotOpen(false);
          setSubmitError(null);
        }}
      />
    </div>
  );
}
