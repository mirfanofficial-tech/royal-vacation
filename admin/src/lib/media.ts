"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import type { MediaAssetUpdate, MediaFolderCreate, MediaFolderUpdate } from "@royal-vacation/api-client";
import { api, callApi } from "@/lib/api";

const MEDIA_FOLDERS_KEY = ["admin", "cms", "media", "folders"] as const;
const MEDIA_ASSETS_KEY = ["admin", "cms", "media", "assets"] as const;

// ---- Folders ----------------------------------------------------------------

export function useMediaFoldersQuery() {
  return useQuery({
    queryKey: MEDIA_FOLDERS_KEY,
    queryFn: () => callApi(() => api.admin.cms.media.folders.list()),
  });
}

// ---- Assets -------------------------------------------------------------------

export interface MediaAssetFilters {
  folder_id?: string;
  asset_type?: string;
  q?: string;
}

export function useMediaAssetsQuery(filters: MediaAssetFilters = {}) {
  return useQuery({
    queryKey: [...MEDIA_ASSETS_KEY, filters],
    queryFn: () => callApi(() => api.admin.cms.media.assets.list(filters)),
  });
}

export function useMediaAssetQuery(id: string | undefined) {
  return useQuery({
    queryKey: [...MEDIA_ASSETS_KEY, "detail", id],
    queryFn: () => callApi(() => api.admin.cms.media.assets.get(id as string)),
    enabled: Boolean(id),
  });
}

export function useMedia(filters: MediaAssetFilters = {}) {
  const foldersQuery = useMediaFoldersQuery();
  const assetsQuery = useMediaAssetsQuery(filters);
  const qc = useQueryClient();
  const invalidate = () => {
    qc.invalidateQueries({ queryKey: MEDIA_FOLDERS_KEY });
    qc.invalidateQueries({ queryKey: MEDIA_ASSETS_KEY });
  };

  const createFolder = useMutation({
    mutationFn: (body: MediaFolderCreate) => callApi(() => api.admin.cms.media.folders.create(body)),
    onSuccess: invalidate,
  });
  const updateFolder = useMutation({
    mutationFn: ({ id, body }: { id: string; body: MediaFolderUpdate }) =>
      callApi(() => api.admin.cms.media.folders.update(id, body)),
    onSuccess: invalidate,
  });
  const deleteFolder = useMutation({
    mutationFn: (id: string) => callApi(() => api.admin.cms.media.folders.remove(id)),
    onSuccess: invalidate,
  });
  const uploadAsset = useMutation({
    mutationFn: ({ file, folderId }: { file: File; folderId?: string | null }) =>
      callApi(() => api.admin.cms.media.assets.upload(file, folderId)),
    onSuccess: invalidate,
  });
  const updateAsset = useMutation({
    mutationFn: ({ id, body }: { id: string; body: MediaAssetUpdate }) =>
      callApi(() => api.admin.cms.media.assets.update(id, body)),
    onSuccess: invalidate,
  });
  const deleteAsset = useMutation({
    mutationFn: (id: string) => callApi(() => api.admin.cms.media.assets.remove(id)),
    onSuccess: invalidate,
  });

  return {
    folders: foldersQuery.data ?? [],
    assets: assetsQuery.data ?? [],
    isLoading: foldersQuery.isLoading || assetsQuery.isLoading,
    error: foldersQuery.error ?? assetsQuery.error,
    refetch: () => {
      foldersQuery.refetch();
      assetsQuery.refetch();
    },
    createFolder: createFolder.mutateAsync,
    updateFolder: (id: string, body: MediaFolderUpdate) => updateFolder.mutateAsync({ id, body }),
    deleteFolder: deleteFolder.mutateAsync,
    uploadAsset: (file: File, folderId?: string | null) =>
      uploadAsset.mutateAsync({ file, folderId }),
    updateAsset: (id: string, body: MediaAssetUpdate) => updateAsset.mutateAsync({ id, body }),
    deleteAsset: deleteAsset.mutateAsync,
    isMutating:
      createFolder.isPending ||
      updateFolder.isPending ||
      deleteFolder.isPending ||
      uploadAsset.isPending ||
      updateAsset.isPending ||
      deleteAsset.isPending,
  };
}
