"use client";

import { useMemo, useState } from "react";

import type { BlogCommentPublicOut } from "@royal-vacation/api-client";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { CommentForm } from "@/components/blog/comment-form";

const PAGE_SIZE = 5;

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function initials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

function CommentAuthorRow({
  comment,
  size,
}: {
  comment: BlogCommentPublicOut;
  size?: "default" | "sm";
}) {
  return (
    <div className="flex gap-3">
      <Avatar size={size}>
        <AvatarFallback className="bg-navy/10 font-semibold text-navy">
          {initials(comment.author_name)}
        </AvatarFallback>
      </Avatar>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <p className="text-sm font-semibold text-foreground">{comment.author_name}</p>
          {comment.is_admin_reply && (
            <span className="rounded-full bg-gold/20 px-2 py-0.5 text-[11px] font-medium text-navy">
              Royal Vacation Team
            </span>
          )}
          <span className="text-xs text-muted-foreground">{formatDate(comment.created_at)}</span>
        </div>
        <p className="mt-1 text-sm text-foreground">{comment.body}</p>
      </div>
    </div>
  );
}

function CommentThread({
  comment,
  replies,
}: {
  comment: BlogCommentPublicOut;
  replies: BlogCommentPublicOut[];
}) {
  return (
    <div className="space-y-3">
      <CommentAuthorRow comment={comment} />
      {replies.length > 0 && (
        <div className="ml-11 space-y-3 border-l border-border pl-4">
          {replies.map((reply) => (
            <CommentAuthorRow key={reply.id} comment={reply} size="sm" />
          ))}
        </div>
      )}
    </div>
  );
}

export function CommentsSection({
  slug,
  comments,
}: {
  slug: string;
  comments: BlogCommentPublicOut[];
}) {
  const [sort, setSort] = useState<"newest" | "oldest">("newest");
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  const repliesByParent = useMemo(() => {
    const map = new Map<string, BlogCommentPublicOut[]>();
    for (const comment of comments) {
      if (comment.parent_comment_id) {
        const list = map.get(comment.parent_comment_id) ?? [];
        list.push(comment);
        map.set(comment.parent_comment_id, list);
      }
    }
    return map;
  }, [comments]);

  const roots = useMemo(() => {
    const list = comments.filter((c) => !c.parent_comment_id);
    return [...list].sort((a, b) => {
      const diff = new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      return sort === "newest" ? -diff : diff;
    });
  }, [comments, sort]);

  const visibleRoots = roots.slice(0, visibleCount);
  const remaining = roots.length - visibleRoots.length;

  return (
    <section className="mt-12 border-t border-border pt-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="font-heading text-xl font-bold text-navy">Comments ({comments.length})</h2>
        {roots.length > 1 && (
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as "newest" | "oldest")}
            className="h-9 rounded-lg border border-border bg-white px-3 text-sm text-foreground outline-none focus:border-navy"
            aria-label="Sort comments"
          >
            <option value="newest">Most recent</option>
            <option value="oldest">Oldest</option>
          </select>
        )}
      </div>

      <div className="mt-6 space-y-6">
        {roots.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No comments yet — be the first to share your thoughts.
          </p>
        ) : (
          visibleRoots.map((comment) => (
            <CommentThread
              key={comment.id}
              comment={comment}
              replies={repliesByParent.get(comment.id) ?? []}
            />
          ))
        )}
      </div>

      {remaining > 0 && (
        <button
          type="button"
          onClick={() => setVisibleCount((c) => c + PAGE_SIZE)}
          className="mt-6 text-sm font-semibold text-navy hover:underline"
        >
          Load {Math.min(remaining, PAGE_SIZE)} more comments
        </button>
      )}

      <div className="mt-8 border-t border-border pt-6">
        <CommentForm slug={slug} />
      </div>
    </section>
  );
}
