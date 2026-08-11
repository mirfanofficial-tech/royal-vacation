"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import type {
  BlogCategoryCreate,
  BlogCategoryUpdate,
  BlogCommentModerate,
  BlogCommentReplyCreate,
  BlogPostCreate,
  BlogPostUpdate,
} from "@royal-vacation/api-client";
import { api, callApi } from "@/lib/api";

const BLOG_CATEGORIES_KEY = ["admin", "blog", "categories"] as const;
const BLOG_POSTS_KEY = ["admin", "blog", "posts"] as const;
const BLOG_COMMENTS_KEY = ["admin", "blog", "comments"] as const;

// ---- Categories -------------------------------------------------------

export function useBlogCategoriesQuery() {
  return useQuery({
    queryKey: BLOG_CATEGORIES_KEY,
    queryFn: () => callApi(() => api.admin.blog.categories.list()),
  });
}

export function useBlogCategories() {
  const query = useBlogCategoriesQuery();
  const qc = useQueryClient();
  const invalidate = () => {
    qc.invalidateQueries({ queryKey: BLOG_CATEGORIES_KEY });
    qc.invalidateQueries({ queryKey: BLOG_POSTS_KEY });
  };

  const createCategory = useMutation({
    mutationFn: (body: BlogCategoryCreate) => callApi(() => api.admin.blog.categories.create(body)),
    onSuccess: invalidate,
  });
  const updateCategory = useMutation({
    mutationFn: ({ id, body }: { id: string; body: BlogCategoryUpdate }) =>
      callApi(() => api.admin.blog.categories.update(id, body)),
    onSuccess: invalidate,
  });
  const deleteCategory = useMutation({
    mutationFn: (id: string) => callApi(() => api.admin.blog.categories.remove(id)),
    onSuccess: invalidate,
  });

  return {
    categories: query.data ?? [],
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
    createCategory: createCategory.mutateAsync,
    updateCategory: (id: string, body: BlogCategoryUpdate) => updateCategory.mutateAsync({ id, body }),
    deleteCategory: deleteCategory.mutateAsync,
    isMutating: createCategory.isPending || updateCategory.isPending || deleteCategory.isPending,
  };
}

// ---- Posts --------------------------------------------------------------

export interface BlogPostFilters {
  category_id?: string;
  status?: string;
  q?: string;
}

export function useBlogPostsQuery(filters: BlogPostFilters = {}) {
  return useQuery({
    queryKey: [...BLOG_POSTS_KEY, filters],
    queryFn: () => callApi(() => api.admin.blog.posts.list(filters)),
  });
}

export function useBlogPosts(filters: BlogPostFilters = {}) {
  const query = useBlogPostsQuery(filters);
  const qc = useQueryClient();
  const invalidate = () => {
    qc.invalidateQueries({ queryKey: BLOG_POSTS_KEY });
    qc.invalidateQueries({ queryKey: BLOG_CATEGORIES_KEY });
  };

  const createPost = useMutation({
    mutationFn: (body: BlogPostCreate) => callApi(() => api.admin.blog.posts.create(body)),
    onSuccess: invalidate,
  });
  const updatePost = useMutation({
    mutationFn: ({ id, body }: { id: string; body: BlogPostUpdate }) =>
      callApi(() => api.admin.blog.posts.update(id, body)),
    onSuccess: invalidate,
  });
  const deletePost = useMutation({
    mutationFn: (id: string) => callApi(() => api.admin.blog.posts.remove(id)),
    onSuccess: invalidate,
  });
  const uploadCoverImage = useMutation({
    mutationFn: ({ id, file }: { id: string; file: File }) =>
      callApi(() => api.admin.blog.posts.uploadCoverImage(id, file)),
    onSuccess: invalidate,
  });

  return {
    posts: query.data ?? [],
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
    createPost: createPost.mutateAsync,
    updatePost: (id: string, body: BlogPostUpdate) => updatePost.mutateAsync({ id, body }),
    deletePost: deletePost.mutateAsync,
    uploadCoverImage: (id: string, file: File) => uploadCoverImage.mutateAsync({ id, file }),
    isMutating:
      createPost.isPending ||
      updatePost.isPending ||
      deletePost.isPending ||
      uploadCoverImage.isPending,
  };
}

// Dedicated single-item fetch — post payloads carry full content + every
// language's translations, too heavy to piggyback off the list cache.
export function useBlogPostQuery(id: string | undefined) {
  return useQuery({
    queryKey: [...BLOG_POSTS_KEY, "detail", id],
    queryFn: () => callApi(() => api.admin.blog.posts.get(id as string)),
    enabled: Boolean(id),
  });
}

// ---- Comments -------------------------------------------------------------

export interface BlogCommentFilters {
  status?: string;
  blog_post_id?: string;
}

export function useBlogCommentsQuery(filters: BlogCommentFilters = {}) {
  return useQuery({
    queryKey: [...BLOG_COMMENTS_KEY, filters],
    queryFn: () => callApi(() => api.admin.blog.comments.list(filters)),
  });
}

export function useBlogComments(filters: BlogCommentFilters = {}) {
  const query = useBlogCommentsQuery(filters);
  const qc = useQueryClient();
  const invalidate = () => {
    qc.invalidateQueries({ queryKey: BLOG_COMMENTS_KEY });
    qc.invalidateQueries({ queryKey: BLOG_POSTS_KEY });
  };

  const moderateComment = useMutation({
    mutationFn: ({ id, body }: { id: string; body: BlogCommentModerate }) =>
      callApi(() => api.admin.blog.comments.moderate(id, body)),
    onSuccess: invalidate,
  });
  const deleteComment = useMutation({
    mutationFn: (id: string) => callApi(() => api.admin.blog.comments.remove(id)),
    onSuccess: invalidate,
  });
  const replyToComment = useMutation({
    mutationFn: ({ id, body }: { id: string; body: BlogCommentReplyCreate }) =>
      callApi(() => api.admin.blog.comments.reply(id, body)),
    onSuccess: invalidate,
  });

  return {
    comments: query.data ?? [],
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
    moderateComment: (id: string, status: "approved" | "rejected") =>
      moderateComment.mutateAsync({ id, body: { status } }),
    deleteComment: deleteComment.mutateAsync,
    replyToComment: (id: string, body: BlogCommentReplyCreate) =>
      replyToComment.mutateAsync({ id, body }),
    isMutating: moderateComment.isPending || deleteComment.isPending || replyToComment.isPending,
  };
}
