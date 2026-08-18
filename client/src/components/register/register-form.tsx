"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm, Controller, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Mail, Apple, User, Lock, Eye, EyeOff, Check, UserPlus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { countryOptions } from "@/lib/checkout-mock-data";
import { GoogleSignInButton } from "@/components/auth/google-sign-in-button";
import { FacebookSignInButton } from "@/components/auth/facebook-sign-in-button";
import { ApiError, register as registerUser } from "@/lib/api";
import { isAuthenticated } from "@/lib/auth";

const registerSchema = z
  .object({
    fullName: z.string().min(1, "Full name is required"),
    email: z.string().min(1, "Email is required").email("Enter a valid email address"),
    dialCode: z.string().min(1),
    phone: z.string().min(6, "Enter a valid phone number"),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Password must contain an uppercase letter")
      .regex(/[0-9]/, "Password must contain a number")
      .regex(/[^A-Za-z0-9]/, "Password must contain a special character"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
    agreeTerms: z.literal(true, {
      message: "You must agree to the Terms & Conditions",
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type RegisterValues = z.infer<typeof registerSchema>;

const passwordRules = [
  { id: "length", label: "8+ characters", test: (v: string) => v.length >= 8 },
  { id: "uppercase", label: "1 uppercase letter", test: (v: string) => /[A-Z]/.test(v) },
  { id: "number", label: "1 number", test: (v: string) => /[0-9]/.test(v) },
  { id: "special", label: "1 special character", test: (v: string) => /[^A-Za-z0-9]/.test(v) },
];

const socialButtons = [
  { id: "apple", label: "Continue with Apple", icon: Apple },
  { id: "email", label: "Continue with Email", icon: Mail },
];

export function RegisterForm() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    if (isAuthenticated()) router.replace("/");
  }, [router]);

  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterValues>({
    resolver: zodResolver(registerSchema),
    mode: "onChange",
    defaultValues: {
      fullName: "",
      email: "",
      dialCode: "+92",
      phone: "",
      password: "",
      confirmPassword: "",
      agreeTerms: false as unknown as true,
    },
  });

  const password = useWatch({ control, name: "password" }) ?? "";

  const onSubmit = handleSubmit(async (values) => {
    setSubmitError(null);
    const [firstName, ...rest] = values.fullName.trim().split(/\s+/);
    try {
      await registerUser({
        email: values.email,
        password: values.password,
        first_name: firstName,
        last_name: rest.join(" ") || undefined,
        phone: `${values.dialCode}${values.phone}`,
        account_type: "traveler",
      });
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
    <div className="flex flex-col gap-6 rounded-2xl border border-border bg-white p-6 sm:p-8">
      <div>
        <h1 className="inline-block border-b-4 border-gold pb-1 font-heading text-3xl font-bold text-navy">
          Create your account
        </h1>
        <p className="mt-3 text-sm text-muted-foreground">
          Join Royal Vacation and unlock a world of amazing travel experiences.
        </p>
      </div>

      <div className="grid grid-cols-4 gap-3">
        <GoogleSignInButton
          onSuccess={() => router.push("/")}
          onError={(message) => setSubmitError(message)}
        />
        <FacebookSignInButton
          onSuccess={() => router.push("/")}
          onError={(message) => setSubmitError(message)}
        />
        {socialButtons.map((social) => (
          <button
            key={social.id}
            type="button"
            aria-label={social.label}
            className="flex h-12 items-center justify-center rounded-lg border border-border py-2.5 text-foreground hover:border-navy hover:bg-muted"
          >
            <social.icon className="h-5 w-5" />
          </button>
        ))}
      </div>

      <div className="flex items-center gap-3">
        <div className="h-px flex-1 bg-border" />
        <span className="text-xs text-muted-foreground">or</span>
        <div className="h-px flex-1 bg-border" />
      </div>

      <form onSubmit={onSubmit} className="flex flex-col gap-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="fullName" className="text-sm font-medium text-foreground">
              Full name
            </label>
            <div className="relative">
              <User className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="fullName"
                {...register("fullName")}
                placeholder="Enter your full name"
                className="pl-9"
              />
            </div>
            {errors.fullName && (
              <span className="text-xs text-destructive">{errors.fullName.message}</span>
            )}
          </div>

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
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="phone" className="text-sm font-medium text-foreground">
              Phone number
            </label>
            <div className="flex gap-2">
              <Controller
                control={control}
                name="dialCode"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger className="w-24 shrink-0">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {countryOptions.map((country) => (
                        <SelectItem key={country.value} value={country.dialCode}>
                          {country.dialCode}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              <Input
                id="phone"
                type="tel"
                {...register("phone")}
                placeholder="300 1234567"
                className="flex-1"
              />
            </div>
            {errors.phone && (
              <span className="text-xs text-destructive">{errors.phone.message}</span>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="password" className="text-sm font-medium text-foreground">
              Password
            </label>
            <div className="relative">
              <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                autoComplete="new-password"
                {...register("password")}
                placeholder="Create a password"
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
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="confirmPassword" className="text-sm font-medium text-foreground">
            Confirm password
          </label>
          <div className="relative">
            <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="confirmPassword"
              type={showConfirmPassword ? "text" : "password"}
              autoComplete="new-password"
              {...register("confirmPassword")}
              placeholder="Confirm your password"
              className="pl-9 pr-9"
            />
            <button
              type="button"
              aria-label={showConfirmPassword ? "Hide password" : "Show password"}
              onClick={() => setShowConfirmPassword((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {errors.confirmPassword && (
            <span className="text-xs text-destructive">{errors.confirmPassword.message}</span>
          )}
        </div>

        <div className="flex flex-wrap gap-x-5 gap-y-1.5 text-xs">
          {passwordRules.map((rule) => {
            const met = rule.test(password);
            return (
              <span
                key={rule.id}
                className={`flex items-center gap-1 ${
                  met ? "text-rating" : "text-muted-foreground"
                }`}
              >
                <Check className={`h-3.5 w-3.5 ${met ? "opacity-100" : "opacity-40"}`} />
                {rule.label}
              </span>
            );
          })}
        </div>

        <div className="flex flex-col gap-1">
          <label className="flex cursor-pointer items-start gap-2 text-sm text-foreground">
            <Controller
              control={control}
              name="agreeTerms"
              render={({ field }) => (
                <Checkbox
                  checked={field.value === true}
                  onCheckedChange={(checked) => field.onChange(checked === true)}
                  className="mt-0.5"
                />
              )}
            />
            <span>
              I agree to the{" "}
              <Link href="#" className="font-semibold text-gold hover:underline">
                Terms &amp; Conditions
              </Link>{" "}
              and{" "}
              <Link href="#" className="font-semibold text-gold hover:underline">
                Privacy Policy
              </Link>
            </span>
          </label>
          {errors.agreeTerms && (
            <span className="text-xs text-destructive">{errors.agreeTerms.message}</span>
          )}
        </div>

        {submitError && (
          <p className="text-center text-sm font-medium text-destructive">{submitError}</p>
        )}

        <Button
          type="submit"
          disabled={isSubmitting}
          className="w-full gap-2 rounded-lg bg-navy text-white hover:bg-navy-light disabled:opacity-60"
        >
          <UserPlus className="h-4 w-4" />
          {isSubmitting ? "Creating account…" : "Create Account"}
        </Button>

        <p className="text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link href="/login" className="font-semibold text-gold hover:underline">
            Sign in
          </Link>
        </p>
      </form>
    </div>
  );
}
