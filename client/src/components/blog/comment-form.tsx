"use client";

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { CheckCircle2 } from "lucide-react";

import { ApiError } from "@royal-vacation/api-client";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

function errorMessage(err: unknown, fallback: string) {
  return err instanceof ApiError ? err.message : fallback;
}

export function CommentForm({ slug }: { slug: string }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [body, setBody] = useState("");
  const [error, setError] = useState("");

  const submit = useMutation({
    mutationFn: () =>
      api.blog.comments.create(slug, {
        author_name: name.trim(),
        author_email: email.trim(),
        body: body.trim(),
      }),
  });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!name.trim() || !email.trim() || !body.trim()) return;
    submit.mutate(undefined, {
      onError: (err) => setError(errorMessage(err, "Couldn't submit your comment.")),
    });
  }

  if (submit.isSuccess) {
    return (
      <div className="flex items-start gap-2 rounded-xl border border-border bg-white p-4 text-sm text-foreground">
        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-rating" />
        <p>
          Thanks — your comment has been submitted and is awaiting moderation. It will appear
          here once approved.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <h3 className="text-sm font-semibold text-foreground">Leave a comment</h3>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Your name"
          required
        />
        <Input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Your email (not published)"
          required
        />
      </div>
      <textarea
        value={body}
        onChange={(e) => setBody(e.target.value)}
        rows={4}
        placeholder="Share your thoughts…"
        required
        className="w-full resize-none rounded-lg border border-input bg-white px-3 py-2 text-sm text-foreground outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
      />
      {error && <p className="text-xs text-destructive">{error}</p>}
      <Button type="submit" disabled={submit.isPending}>
        {submit.isPending ? "Submitting…" : "Post comment"}
      </Button>
    </form>
  );
}
