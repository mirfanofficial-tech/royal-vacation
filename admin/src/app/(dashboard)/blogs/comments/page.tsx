"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AlertTriangle, Check, Loader2, MessageSquare, Reply as ReplyIcon, Trash2, X } from "lucide-react";

import type { BlogCommentAdminOut } from "@royal-vacation/api-client";
import { ApiError } from "@/lib/api";
import { useBlogComments } from "@/lib/blog";
import { usePermissions } from "@/lib/roles";
import { PermissionGuard } from "@/components/permission-guard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const statusTabs = [
  { value: "pending", label: "Pending" },
  { value: "approved", label: "Approved" },
  { value: "rejected", label: "Rejected" },
  { value: "all", label: "All" },
] as const;

type StatusTab = (typeof statusTabs)[number]["value"];

function errorMessage(err: unknown, fallback: string) {
  return err instanceof ApiError ? err.message : fallback;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" });
}

function CommentsInbox() {
  const [statusFilter, setStatusFilter] = useState<StatusTab>("pending");
  const [postId, setPostId] = useState<string | undefined>(undefined);
  const [replyingId, setReplyingId] = useState<string | null>(null);
  const [replyBody, setReplyBody] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const post = params.get("post");
    if (post) setPostId(post);
  }, []);

  const { comments, isLoading, moderateComment, deleteComment, replyToComment, isMutating } = useBlogComments({
    status: statusFilter === "all" ? undefined : statusFilter,
    blog_post_id: postId,
  });
  const { can } = usePermissions();

  const postTitle = postId ? comments[0]?.post_title : undefined;

  function clearPostFilter() {
    setPostId(undefined);
    window.history.replaceState(null, "", "/blogs/comments");
  }

  async function handleModerate(comment: BlogCommentAdminOut, status: "approved" | "rejected") {
    try {
      await moderateComment(comment.id, status);
    } catch (err) {
      setError(errorMessage(err, "Couldn't update this comment."));
    }
  }

  async function handleDelete(comment: BlogCommentAdminOut) {
    if (!window.confirm("Delete this comment? This cannot be undone.")) return;
    try {
      await deleteComment(comment.id);
    } catch (err) {
      setError(errorMessage(err, "Couldn't delete this comment."));
    }
  }

  async function handleReply(comment: BlogCommentAdminOut) {
    if (!replyBody.trim()) return;
    try {
      await replyToComment(comment.id, { body: replyBody.trim() });
      setReplyingId(null);
      setReplyBody("");
    } catch (err) {
      setError(errorMessage(err, "Couldn't post reply."));
    }
  }

  return (
    <div className="space-y-6 p-6 lg:p-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-semibold text-navy">
            <MessageSquare className="size-6" />
            Comments
          </h1>
          <p className="text-sm text-muted-foreground">Moderate reader comments across all posts.</p>
        </div>
        {postId && (
          <Button variant="outline" size="sm" onClick={clearPostFilter}>
            Clear post filter
          </Button>
        )}
      </div>

      {postId && (
        <p className="text-sm text-muted-foreground">
          Filtered to: <span className="font-medium text-foreground">{postTitle ?? "this post"}</span>
        </p>
      )}

      {error && (
        <div className="flex items-center gap-1.5 rounded-lg border border-destructive/20 bg-destructive/10 px-3 py-2.5 text-sm break-words text-destructive">
          <AlertTriangle className="size-3.5 shrink-0" />
          {error}
        </div>
      )}

      <Card className="p-1.5">
        <div className="flex flex-wrap gap-1">
          {statusTabs.map((tab) => (
            <button
              key={tab.value}
              type="button"
              onClick={() => setStatusFilter(tab.value)}
              className={cn(
                "flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors",
                statusFilter === tab.value
                  ? "border-b-2 border-navy text-navy"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </Card>

      <Card>
        <CardHeader className="border-b">
          <p className="text-lg font-semibold text-foreground">Records</p>
          <p className="text-sm text-muted-foreground">Total: {comments.length} records</p>
        </CardHeader>
        <CardContent className="divide-y divide-border p-0">
          {isLoading && (
            <div className="flex justify-center py-12">
              <Loader2 className="size-5 animate-spin text-muted-foreground" />
            </div>
          )}
          {!isLoading && comments.length === 0 && (
            <p className="px-6 py-12 text-center text-sm text-muted-foreground">
              No comments match this filter.
            </p>
          )}
          {!isLoading &&
            comments.map((comment) => (
              <div key={comment.id} className="space-y-2 px-6 py-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-medium text-foreground">{comment.author_name}</p>
                      {comment.is_admin_reply && <Badge variant="secondary">Team reply</Badge>}
                      <Badge
                        variant={
                          comment.status === "approved"
                            ? "default"
                            : comment.status === "rejected"
                              ? "outline"
                              : "secondary"
                        }
                      >
                        {comment.status}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">{comment.author_email}</p>
                    <Link
                      href={`/blogs/${comment.blog_post_id}`}
                      className="text-xs text-muted-foreground hover:text-navy hover:underline"
                    >
                      on &ldquo;{comment.post_title}&rdquo;
                    </Link>
                  </div>
                  <p className="shrink-0 text-xs text-muted-foreground">
                    {formatDate(comment.created_at)}
                  </p>
                </div>
                <p className="text-sm text-foreground">{comment.body}</p>
                <div className="flex flex-wrap items-center gap-1.5 pt-1">
                  {can("blog", "edit") && comment.status !== "approved" && (
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={isMutating}
                      onClick={() => handleModerate(comment, "approved")}
                    >
                      <Check data-icon="inline-start" />
                      Approve
                    </Button>
                  )}
                  {can("blog", "edit") && comment.status !== "rejected" && (
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={isMutating}
                      onClick={() => handleModerate(comment, "rejected")}
                    >
                      <X data-icon="inline-start" />
                      Reject
                    </Button>
                  )}
                  {can("blog", "edit") && (
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={isMutating}
                      onClick={() => {
                        setReplyingId(replyingId === comment.id ? null : comment.id);
                        setReplyBody("");
                      }}
                    >
                      <ReplyIcon data-icon="inline-start" />
                      Reply
                    </Button>
                  )}
                  {can("blog", "delete") && (
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={isMutating}
                      onClick={() => handleDelete(comment)}
                    >
                      <Trash2 data-icon="inline-start" />
                      Delete
                    </Button>
                  )}
                </div>
                {replyingId === comment.id && (
                  <div className="flex flex-col gap-2 rounded-lg border border-border bg-muted/30 p-3">
                    <textarea
                      value={replyBody}
                      onChange={(e) => setReplyBody(e.target.value)}
                      rows={2}
                      placeholder="Write a public reply as Royal Vacation Team…"
                      className="w-full resize-none rounded-lg border border-input bg-background px-2.5 py-1.5 text-sm text-foreground outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                    />
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="sm" onClick={() => setReplyingId(null)}>
                        Cancel
                      </Button>
                      <Button
                        size="sm"
                        disabled={!replyBody.trim() || isMutating}
                        onClick={() => handleReply(comment)}
                      >
                        Post reply
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            ))}
        </CardContent>
      </Card>
    </div>
  );
}

export default function BlogCommentsPage() {
  return (
    <PermissionGuard module="blog">
      <CommentsInbox />
    </PermissionGuard>
  );
}
