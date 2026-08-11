"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import type { SiteThemeUpdate } from "@royal-vacation/api-client";
import { api, callApi } from "@/lib/api";

const THEME_KEY = ["theme"] as const;

export function useThemeQuery() {
  return useQuery({
    queryKey: THEME_KEY,
    queryFn: () => callApi(() => api.admin.theme.get()),
  });
}

export function useTheme() {
  const query = useThemeQuery();
  const qc = useQueryClient();
  const invalidate = () => qc.invalidateQueries({ queryKey: THEME_KEY });

  const updateTheme = useMutation({
    mutationFn: (body: SiteThemeUpdate) => callApi(() => api.admin.theme.update(body)),
    onSuccess: invalidate,
  });
  const uploadLogo = useMutation({
    mutationFn: (file: File) => callApi(() => api.admin.theme.uploadLogo(file)),
    onSuccess: invalidate,
  });

  return {
    theme: query.data,
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
    updateTheme: updateTheme.mutateAsync,
    uploadLogo: uploadLogo.mutateAsync,
    isSaving: updateTheme.isPending,
    isUploadingLogo: uploadLogo.isPending,
  };
}
