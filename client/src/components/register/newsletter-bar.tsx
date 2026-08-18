"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const newsletterSchema = z.object({
  email: z.string().min(1, "Please enter your email").email("Enter a valid email address"),
});

type NewsletterValues = z.infer<typeof newsletterSchema>;

export function NewsletterBar() {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitSuccessful },
  } = useForm<NewsletterValues>({
    resolver: zodResolver(newsletterSchema),
    defaultValues: { email: "" },
  });

  const onSubmit = handleSubmit((values) => {
    console.log("newsletter signup", values);
    reset();
  });

  return (
    <div className="bg-navy/5">
      <div className="mx-auto flex max-w-[1400px] flex-col gap-4 px-10 py-6 sm:flex-row sm:items-center sm:justify-between lg:px-24">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gold/15 text-gold">
            <Mail className="h-5 w-5" />
          </span>
          <div>
            <p className="text-sm font-semibold text-navy">Get the best travel deals & offers!</p>
            <p className="text-sm text-muted-foreground">
              Subscribe to our newsletter and never miss an update.
            </p>
          </div>
        </div>

        <form onSubmit={onSubmit} className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
          <div className="w-full sm:w-72">
            <Input
              {...register("email")}
              type="email"
              autoComplete="off"
              placeholder="Enter your email address"
              className="h-11 rounded-lg bg-white"
            />
            {errors.email && (
              <span className="mt-1 block text-xs text-destructive">{errors.email.message}</span>
            )}
            {isSubmitSuccessful && !errors.email && (
              <span className="mt-1 block text-xs text-rating">Thanks for subscribing!</span>
            )}
          </div>
          <Button
            type="submit"
            className="h-11 shrink-0 rounded-lg bg-navy text-white hover:bg-navy-light"
          >
            Subscribe
          </Button>
        </form>
      </div>
    </div>
  );
}
