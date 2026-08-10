"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Apple, Mail, Lock, Eye, EyeOff, ArrowRight, ShieldCheck } from "lucide-react";
import { GoogleIcon } from "@/components/icons/social-icons";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";

const loginSchema = z.object({
  email: z.string().min(1, "Email is required").email("Enter a valid email address"),
  password: z.string().min(1, "Password is required"),
  rememberMe: z.boolean(),
});

type LoginValues = z.infer<typeof loginSchema>;

const socialButtons = [
  { id: "google", label: "Continue with Google", icon: GoogleIcon },
  { id: "apple", label: "Continue with Apple", icon: Apple },
];

export function LoginForm() {
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "", rememberMe: true },
  });

  const onSubmit = handleSubmit((values) => {
    console.log("login", values);
  });

  return (
    <div className="flex flex-col gap-6 p-6 sm:p-10">
      <div>
        <h1 className="font-heading text-3xl font-bold text-navy">Welcome back 👋</h1>
        <p className="mt-2 text-sm text-muted-foreground">Sign in to your account</p>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {socialButtons.map((social) => (
          <button
            key={social.id}
            type="button"
            className="flex items-center justify-center gap-2 rounded-lg border border-border py-2.5 text-sm font-medium text-foreground hover:border-navy hover:bg-muted"
          >
            <social.icon className="h-4 w-4" />
            {social.label}
          </button>
        ))}
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
            <Link href="#" className="text-xs font-semibold text-gold hover:underline">
              Forgot password?
            </Link>
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

        <Button
          type="submit"
          disabled={isSubmitting}
          className="w-full gap-2 rounded-lg bg-navy text-white hover:bg-navy-light disabled:opacity-60"
        >
          <Lock className="h-4 w-4" />
          Sign in to your account
          <ArrowRight className="h-4 w-4" />
        </Button>

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
    </div>
  );
}
