"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useForm, Controller, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { countryOptions } from "@/lib/checkout-mock-data";

const guestInfoSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().min(1, "Email is required").email("Enter a valid email address"),
  dialCode: z.string().min(1),
  phone: z.string().min(6, "Enter a valid phone number"),
  country: z.string().min(1, "Please select a country"),
  whatsappUpdates: z.boolean(),
});

export type GuestInfoValues = z.infer<typeof guestInfoSchema>;

export function GuestInfoForm({
  onValuesChange,
}: {
  onValuesChange?: (values: GuestInfoValues, isValid: boolean) => void;
}) {
  const {
    register,
    control,
    formState: { errors, isValid },
  } = useForm<GuestInfoValues>({
    resolver: zodResolver(guestInfoSchema),
    mode: "onChange",
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      dialCode: "+92",
      phone: "",
      country: "PK",
      whatsappUpdates: true,
    },
  });

  const values = useWatch({ control });

  useEffect(() => {
    onValuesChange?.(values as GuestInfoValues, isValid);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(values), isValid]);

  return (
    <div className="rounded-xl border border-border bg-white p-5">
      <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-base font-semibold text-navy">Guest Information</h2>
          <p className="text-sm text-muted-foreground">
            Enter the primary guest details for this booking.
          </p>
        </div>
        <p className="text-sm text-muted-foreground sm:shrink-0">
          Already have an account?{" "}
          <Link href="#" className="font-semibold text-gold hover:underline">
            Sign in
          </Link>
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="firstName" className="text-sm font-medium text-foreground">
            First name <span className="text-destructive">*</span>
          </label>
          <Input id="firstName" {...register("firstName")} placeholder="Ali" />
          {errors.firstName && (
            <span className="text-xs text-destructive">{errors.firstName.message}</span>
          )}
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="lastName" className="text-sm font-medium text-foreground">
            Last name <span className="text-destructive">*</span>
          </label>
          <Input id="lastName" {...register("lastName")} placeholder="Khan" />
          {errors.lastName && (
            <span className="text-xs text-destructive">{errors.lastName.message}</span>
          )}
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="email" className="text-sm font-medium text-foreground">
            Email address <span className="text-destructive">*</span>
          </label>
          <Input
            id="email"
            type="email"
            autoComplete="off"
            {...register("email")}
            placeholder="ali.khan@email.com"
          />
          {errors.email && (
            <span className="text-xs text-destructive">{errors.email.message}</span>
          )}
        </div>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="phone" className="text-sm font-medium text-foreground">
            Phone number <span className="text-destructive">*</span>
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
          <label htmlFor="country" className="text-sm font-medium text-foreground">
            Country / Region <span className="text-destructive">*</span>
          </label>
          <Controller
            control={control}
            name="country"
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger id="country" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {countryOptions.map((country) => (
                    <SelectItem key={country.value} value={country.value}>
                      {country.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        </div>
      </div>

      <label className="mt-4 flex cursor-pointer items-center gap-2 text-sm text-foreground">
        <Controller
          control={control}
          name="whatsappUpdates"
          render={({ field }) => (
            <Checkbox
              checked={field.value}
              onCheckedChange={(checked) => field.onChange(checked === true)}
            />
          )}
        />
        Receive booking confirmation and trip updates on WhatsApp
      </label>
    </div>
  );
}
