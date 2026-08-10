"use client";

import Image from "next/image";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const newsletterSchema = z.object({
  email: z.string().min(1, "Please enter your email").email("Enter a valid email address"),
});

type NewsletterValues = z.infer<typeof newsletterSchema>;

export function NewsletterBanner() {
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
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-navy-dark via-navy to-navy-light">
      <div className="relative flex flex-col items-start gap-6 p-6 sm:p-8 lg:flex-row lg:items-center lg:justify-between">
        <div className="max-w-md">
          <h2 className="font-heading text-2xl font-bold text-white">
            Get exclusive travel deals &amp; inspiration
          </h2>
          <p className="mt-2 text-sm text-white/80">
            Subscribe to our newsletter and be the first to know about amazing destinations and
            offers.
          </p>

          <form onSubmit={onSubmit} className="mt-4 flex flex-col gap-2 sm:flex-row">
            <div className="flex-1">
              <Input
                {...register("email")}
                type="email"
                placeholder="Enter your email address"
                autoComplete="off"
                className="h-11 rounded-lg border-none bg-white px-4 text-sm text-foreground"
              />
              {errors.email && (
                <span className="mt-1 block text-xs text-gold-light">{errors.email.message}</span>
              )}
              {isSubmitSuccessful && !errors.email && (
                <span className="mt-1 block text-xs text-gold-light">
                  Thanks for subscribing!
                </span>
              )}
            </div>
            <Button
              type="submit"
              className="h-11 shrink-0 rounded-lg bg-gold text-navy-dark hover:bg-gold-light"
            >
              Subscribe
            </Button>
          </form>
        </div>

        <div className="hidden shrink-0 items-end gap-3 lg:flex">
          <div className="relative h-32 w-24 -rotate-6 overflow-hidden rounded-lg border-4 border-white shadow-lg">
            <Image
              src="https://picsum.photos/seed/dubai-newsletter-1/200/280"
              alt=""
              fill
              className="object-cover"
              sizes="96px"
            />
          </div>
          <div className="relative h-36 w-28 overflow-hidden rounded-lg border-4 border-white shadow-lg">
            <Image
              src="https://picsum.photos/seed/dubai-newsletter-2/220/300"
              alt=""
              fill
              className="object-cover"
              sizes="112px"
            />
          </div>
          <div className="relative h-32 w-24 rotate-6 overflow-hidden rounded-lg border-4 border-white shadow-lg">
            <Image
              src="https://picsum.photos/seed/dubai-newsletter-3/200/280"
              alt=""
              fill
              className="object-cover"
              sizes="96px"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
