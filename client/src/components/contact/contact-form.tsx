"use client";

import { useState } from "react";
import { useForm, Controller, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Paperclip, Send } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { api } from "@/lib/api";
import { ApiError } from "@royal-vacation/api-client";
import type { ContactChannel, ContactTopic } from "@royal-vacation/api-client";

const MESSAGE_MAX_LENGTH = 1500;

const topicOptions: { value: ContactTopic; label: string }[] = [
  { value: "booking", label: "Booking question" },
  { value: "refund", label: "Refund status" },
  { value: "invoice", label: "Invoice or receipt" },
  { value: "stay_issue", label: "Problem with a stay" },
  { value: "group", label: "Group & corporate travel" },
  { value: "press", label: "Press & partnerships" },
  { value: "other", label: "Something else" },
];

const channelOptions: { value: ContactChannel; label: string }[] = [
  { value: "email", label: "Email" },
  { value: "phone", label: "Phone call" },
  { value: "whatsapp", label: "WhatsApp" },
];

const topicValues = topicOptions.map((t) => t.value) as [ContactTopic, ...ContactTopic[]];
const channelValues = channelOptions.map((c) => c.value) as [ContactChannel, ...ContactChannel[]];

const contactSchema = z.object({
  fullName: z.string().min(1, "Full name is required"),
  email: z.string().min(1, "Email is required").email("Enter a valid email address"),
  phone: z.string().optional(),
  bookingReference: z.string().optional(),
  topic: z.enum(topicValues, { message: "Please choose a topic" }),
  preferredChannel: z.enum(channelValues),
  message: z
    .string()
    .min(1, "Tell us how we can help")
    .max(MESSAGE_MAX_LENGTH, `Message must be under ${MESSAGE_MAX_LENGTH} characters`),
  agree: z.literal(true, { message: "Please agree to the Privacy Policy" }),
});

type ContactValues = z.infer<typeof contactSchema>;

export function ContactForm() {
  const [attachment, setAttachment] = useState<File | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting, isSubmitSuccessful },
  } = useForm<ContactValues>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      fullName: "",
      email: "",
      phone: "",
      bookingReference: "",
      topic: undefined as unknown as ContactValues["topic"],
      preferredChannel: "email",
      message: "",
      agree: false as unknown as true,
    },
  });

  const message = useWatch({ control, name: "message" }) ?? "";

  const onSubmit = handleSubmit(async (values) => {
    setSubmitError(null);
    try {
      await api.contact.send({
        full_name: values.fullName,
        email: values.email,
        phone: values.phone || undefined,
        booking_reference: values.bookingReference || undefined,
        topic: values.topic,
        preferred_channel: values.preferredChannel,
        message: values.message,
      });
      setAttachment(null);
      reset();
    } catch (error) {
      setSubmitError(
        error instanceof ApiError
          ? error.message
          : "Something went wrong sending your message. Please try again."
      );
    }
  });

  return (
    <div className="rounded-2xl border border-border bg-white p-6 sm:p-8">
      <h2 className="font-heading text-2xl font-bold text-navy">Send us a message</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        Fill in what you can — the more detail, the faster we can help.
      </p>

      <form onSubmit={onSubmit} className="mt-6 flex flex-col gap-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="fullName" className="text-sm font-medium text-foreground">
              Full name
            </label>
            <Input id="fullName" {...register("fullName")} placeholder="Jane Doe" />
            {errors.fullName && (
              <span className="text-xs text-destructive">{errors.fullName.message}</span>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="email" className="text-sm font-medium text-foreground">
              Email address
            </label>
            <Input
              id="email"
              type="email"
              autoComplete="off"
              {...register("email")}
              placeholder="jane@email.com"
            />
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
            <Input
              id="phone"
              type="tel"
              {...register("phone")}
              placeholder="+971 50 000 0000"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="bookingReference" className="text-sm font-medium text-foreground">
              Booking reference (optional)
            </label>
            <Input
              id="bookingReference"
              {...register("bookingReference")}
              placeholder="RV-000000"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-foreground">What is this about?</label>
            <Controller
              control={control}
              name="topic"
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Choose a topic" />
                  </SelectTrigger>
                  <SelectContent>
                    {topicOptions.map((topic) => (
                      <SelectItem key={topic.value} value={topic.value}>
                        {topic.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.topic && (
              <span className="text-xs text-destructive">{errors.topic.message}</span>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-foreground">Preferred reply channel</label>
            <Controller
              control={control}
              name="preferredChannel"
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {channelOptions.map((channel) => (
                      <SelectItem key={channel.value} value={channel.value}>
                        {channel.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="message" className="text-sm font-medium text-foreground">
            How can we help?
          </label>
          <Textarea
            id="message"
            {...register("message")}
            maxLength={MESSAGE_MAX_LENGTH}
            rows={5}
            placeholder="Tell us about your trip, your dates, and anything that would help us answer properly…"
          />
          <div className="flex items-center justify-between">
            {errors.message ? (
              <span className="text-xs text-destructive">{errors.message.message}</span>
            ) : (
              <label className="flex cursor-pointer items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-navy">
                <Paperclip className="h-3.5 w-3.5" />
                {attachment ? attachment.name : "Attach a file"}
                <input
                  type="file"
                  className="sr-only"
                  onChange={(event) => setAttachment(event.target.files?.[0] ?? null)}
                />
              </label>
            )}
            <span className="shrink-0 text-xs text-muted-foreground">
              {message.length} / {MESSAGE_MAX_LENGTH}
            </span>
          </div>
        </div>

        <div className="flex flex-col gap-1">
          <label className="flex cursor-pointer items-start gap-2 text-sm text-foreground">
            <Controller
              control={control}
              name="agree"
              render={({ field }) => (
                <Checkbox
                  checked={field.value === true}
                  onCheckedChange={(checked) => field.onChange(checked === true)}
                  className="mt-0.5"
                />
              )}
            />
            <span>I agree to the Privacy Policy and to being contacted about this enquiry.</span>
          </label>
          {errors.agree && (
            <span className="text-xs text-destructive">{errors.agree.message}</span>
          )}
        </div>

        <div className="flex flex-col gap-3 border-t border-border pt-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-muted-foreground">
            We never share your details. Typical reply: under 2 hours.
          </p>
          <Button
            type="submit"
            disabled={isSubmitting}
            className="gap-2 rounded-lg bg-navy text-white hover:bg-navy-light disabled:opacity-60"
          >
            {isSubmitting ? "Sending…" : "Send message"}
            <Send className="h-4 w-4" />
          </Button>
        </div>

        {isSubmitSuccessful && !submitError && (
          <p className="text-center text-sm font-medium text-rating">
            Message sent! Our team will reply within 2 hours.
          </p>
        )}
        {submitError && (
          <p className="text-center text-sm font-medium text-destructive">{submitError}</p>
        )}
      </form>
    </div>
  );
}
