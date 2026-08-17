"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import type {
  TranslationTaskCreate,
  TranslationTaskUpdate,
} from "@royal-vacation/api-client";
import { api, callApi } from "@/lib/api";

const TRANSLATION_TASKS_KEY = ["admin", "cms", "translations"] as const;

// ---- List + mutations -------------------------------------------------------

export interface TranslationTaskFilters {
  entity_type?: string;
  status?: string;
}

export function useTranslationTasksQuery(filters: TranslationTaskFilters = {}) {
  return useQuery({
    queryKey: [...TRANSLATION_TASKS_KEY, filters],
    queryFn: () => callApi(() => api.admin.cms.translations.list(filters)),
  });
}

export function useTranslationTasks(filters: TranslationTaskFilters = {}) {
  const query = useTranslationTasksQuery(filters);
  const qc = useQueryClient();
  const invalidate = () => qc.invalidateQueries({ queryKey: TRANSLATION_TASKS_KEY });

  const requestTranslation = useMutation({
    mutationFn: (body: TranslationTaskCreate) =>
      callApi(() => api.admin.cms.translations.create(body)),
    onSuccess: invalidate,
  });
  const updateTask = useMutation({
    mutationFn: ({ id, body }: { id: string; body: TranslationTaskUpdate }) =>
      callApi(() => api.admin.cms.translations.update(id, body)),
    onSuccess: invalidate,
  });
  const deleteTask = useMutation({
    mutationFn: (id: string) => callApi(() => api.admin.cms.translations.remove(id)),
    onSuccess: invalidate,
  });

  return {
    tasks: query.data ?? [],
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
    requestTranslation: requestTranslation.mutateAsync,
    updateTask: (id: string, body: TranslationTaskUpdate) => updateTask.mutateAsync({ id, body }),
    deleteTask: deleteTask.mutateAsync,
    isMutating:
      requestTranslation.isPending || updateTask.isPending || deleteTask.isPending,
  };
}

// Convenience: tasks that target a single entity, plus the mutations — used by
// the editors to show the "translation requested" state on the toolbar button
// and to create requests inline.
export function useEntityTranslationTasks(
  entityType: "cms_page" | "blog_post" | undefined,
  entityId: string | undefined
) {
  const qc = useQueryClient();
  const invalidate = () => qc.invalidateQueries({ queryKey: TRANSLATION_TASKS_KEY });

  const query = useQuery({
    queryKey: [...TRANSLATION_TASKS_KEY, entityType, entityId],
    queryFn: () =>
      callApi(() =>
        api.admin.cms.translations.list({
          entity_type: entityType as string,
        })
      ),
    enabled: Boolean(entityType && entityId),
  });

  const requestTranslation = useMutation({
    mutationFn: (target_language_code: string) =>
      callApi(() =>
        api.admin.cms.translations.create({
          entity_type: entityType as "cms_page" | "blog_post",
          entity_id: entityId as string,
          target_language_code,
        })
      ),
    onSuccess: invalidate,
  });

  return {
    tasks: (query.data ?? []).filter((t) => t.entity_id === entityId),
    isLoading: query.isLoading,
    requestTranslation: requestTranslation.mutateAsync,
    isMutating: requestTranslation.isPending,
  };
}
