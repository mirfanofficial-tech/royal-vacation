"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import type {
  CmsBlockCreate,
  CmsBlockUpdate,
  CmsMenuCreate,
  CmsMenuItemCreate,
  CmsMenuItemUpdate,
  CmsMenuUpdate,
  CmsPageCreate,
  CmsPageUpdate,
} from "@royal-vacation/api-client";
import { api, callApi } from "@/lib/api";

const CMS_PAGES_KEY = ["admin", "cms", "pages"] as const;
const CMS_BLOCKS_KEY = ["admin", "cms", "blocks"] as const;
const CMS_MENUS_KEY = ["admin", "cms", "menus"] as const;
const CMS_PAGE_REVISIONS_KEY = ["admin", "cms", "pages", "revisions"] as const;

// ---- Pages ----------------------------------------------------------------

export interface CmsPageFilters {
  status?: string;
  q?: string;
}

export function useCmsPagesQuery(filters: CmsPageFilters = {}) {
  return useQuery({
    queryKey: [...CMS_PAGES_KEY, filters],
    queryFn: () => callApi(() => api.admin.cms.pages.list(filters)),
  });
}

export function useCmsPages(filters: CmsPageFilters = {}) {
  const query = useCmsPagesQuery(filters);
  const qc = useQueryClient();
  const invalidate = () => qc.invalidateQueries({ queryKey: CMS_PAGES_KEY });

  const createPage = useMutation({
    mutationFn: (body: CmsPageCreate) => callApi(() => api.admin.cms.pages.create(body)),
    onSuccess: invalidate,
  });
  const updatePage = useMutation({
    mutationFn: ({
      id,
      body,
      createRevision,
    }: {
      id: string;
      body: CmsPageUpdate;
      createRevision?: boolean;
    }) => callApi(() => api.admin.cms.pages.update(id, body, { createRevision })),
    onSuccess: invalidate,
  });
  const deletePage = useMutation({
    mutationFn: (id: string) => callApi(() => api.admin.cms.pages.remove(id)),
    onSuccess: invalidate,
  });
  const uploadFeaturedImage = useMutation({
    mutationFn: ({ id, file }: { id: string; file: File }) =>
      callApi(() => api.admin.cms.pages.uploadFeaturedImage(id, file)),
    onSuccess: invalidate,
  });

  return {
    pages: query.data ?? [],
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
    createPage: createPage.mutateAsync,
    updatePage: (id: string, body: CmsPageUpdate, createRevision?: boolean) =>
      updatePage.mutateAsync({ id, body, createRevision }),
    deletePage: deletePage.mutateAsync,
    uploadFeaturedImage: (id: string, file: File) => uploadFeaturedImage.mutateAsync({ id, file }),
    isMutating:
      createPage.isPending ||
      updatePage.isPending ||
      deletePage.isPending ||
      uploadFeaturedImage.isPending,
  };
}

// Dedicated single-item fetch — page payloads carry full content, too heavy
// to piggyback off the list cache (same reasoning as blog posts).
export function useCmsPageQuery(id: string | undefined) {
  return useQuery({
    queryKey: [...CMS_PAGES_KEY, "detail", id],
    queryFn: () => callApi(() => api.admin.cms.pages.get(id as string)),
    enabled: Boolean(id),
  });
}

export function useCmsPageRevisions(pageId: string | undefined) {
  const query = useQuery({
    queryKey: [...CMS_PAGE_REVISIONS_KEY, pageId],
    queryFn: () => callApi(() => api.admin.cms.pages.revisions.list(pageId as string)),
    enabled: Boolean(pageId),
  });
  const qc = useQueryClient();

  const restoreRevision = useMutation({
    mutationFn: (revisionId: string) =>
      callApi(() => api.admin.cms.pages.revisions.restore(pageId as string, revisionId)),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [...CMS_PAGE_REVISIONS_KEY, pageId] });
      qc.invalidateQueries({ queryKey: [...CMS_PAGES_KEY, "detail", pageId] });
    },
  });

  return {
    revisions: query.data ?? [],
    isLoading: query.isLoading,
    getRevisionDetail: (revisionId: string) =>
      callApi(() => api.admin.cms.pages.revisions.get(pageId as string, revisionId)),
    restoreRevision: restoreRevision.mutateAsync,
    isMutating: restoreRevision.isPending,
  };
}

// ---- Blocks -----------------------------------------------------------------

export function useCmsBlocksQuery() {
  return useQuery({
    queryKey: CMS_BLOCKS_KEY,
    queryFn: () => callApi(() => api.admin.cms.blocks.list()),
  });
}

export function useCmsBlocks() {
  const query = useCmsBlocksQuery();
  const qc = useQueryClient();
  const invalidate = () => qc.invalidateQueries({ queryKey: CMS_BLOCKS_KEY });

  const createBlock = useMutation({
    mutationFn: (body: CmsBlockCreate) => callApi(() => api.admin.cms.blocks.create(body)),
    onSuccess: invalidate,
  });
  const updateBlock = useMutation({
    mutationFn: ({ id, body }: { id: string; body: CmsBlockUpdate }) =>
      callApi(() => api.admin.cms.blocks.update(id, body)),
    onSuccess: invalidate,
  });
  const deleteBlock = useMutation({
    mutationFn: (id: string) => callApi(() => api.admin.cms.blocks.remove(id)),
    onSuccess: invalidate,
  });

  return {
    blocks: query.data ?? [],
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
    createBlock: createBlock.mutateAsync,
    updateBlock: (id: string, body: CmsBlockUpdate) => updateBlock.mutateAsync({ id, body }),
    deleteBlock: deleteBlock.mutateAsync,
    isMutating: createBlock.isPending || updateBlock.isPending || deleteBlock.isPending,
  };
}

export function useCmsBlockQuery(id: string | undefined) {
  return useQuery({
    queryKey: [...CMS_BLOCKS_KEY, "detail", id],
    queryFn: () => callApi(() => api.admin.cms.blocks.get(id as string)),
    enabled: Boolean(id),
  });
}

// ---- Menus ------------------------------------------------------------------

export function useCmsMenusQuery() {
  return useQuery({
    queryKey: CMS_MENUS_KEY,
    queryFn: () => callApi(() => api.admin.cms.menus.list()),
  });
}

export function useCmsMenus() {
  const query = useCmsMenusQuery();
  const qc = useQueryClient();
  const invalidate = () => qc.invalidateQueries({ queryKey: CMS_MENUS_KEY });

  const createMenu = useMutation({
    mutationFn: (body: CmsMenuCreate) => callApi(() => api.admin.cms.menus.create(body)),
    onSuccess: invalidate,
  });
  const updateMenu = useMutation({
    mutationFn: ({ id, body }: { id: string; body: CmsMenuUpdate }) =>
      callApi(() => api.admin.cms.menus.update(id, body)),
    onSuccess: invalidate,
  });
  const deleteMenu = useMutation({
    mutationFn: (id: string) => callApi(() => api.admin.cms.menus.remove(id)),
    onSuccess: invalidate,
  });
  const addItem = useMutation({
    mutationFn: ({ menuId, body }: { menuId: string; body: CmsMenuItemCreate }) =>
      callApi(() => api.admin.cms.menus.addItem(menuId, body)),
    onSuccess: invalidate,
  });
  const updateItem = useMutation({
    mutationFn: ({
      menuId,
      itemId,
      body,
    }: {
      menuId: string;
      itemId: string;
      body: CmsMenuItemUpdate;
    }) => callApi(() => api.admin.cms.menus.updateItem(menuId, itemId, body)),
    onSuccess: invalidate,
  });
  const removeItem = useMutation({
    mutationFn: ({ menuId, itemId }: { menuId: string; itemId: string }) =>
      callApi(() => api.admin.cms.menus.removeItem(menuId, itemId)),
    onSuccess: invalidate,
  });

  return {
    menus: query.data ?? [],
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
    createMenu: createMenu.mutateAsync,
    updateMenu: (id: string, body: CmsMenuUpdate) => updateMenu.mutateAsync({ id, body }),
    deleteMenu: deleteMenu.mutateAsync,
    addItem: (menuId: string, body: CmsMenuItemCreate) => addItem.mutateAsync({ menuId, body }),
    updateItem: (menuId: string, itemId: string, body: CmsMenuItemUpdate) =>
      updateItem.mutateAsync({ menuId, itemId, body }),
    removeItem: (menuId: string, itemId: string) => removeItem.mutateAsync({ menuId, itemId }),
    isMutating:
      createMenu.isPending ||
      updateMenu.isPending ||
      deleteMenu.isPending ||
      addItem.isPending ||
      updateItem.isPending ||
      removeItem.isPending,
  };
}
