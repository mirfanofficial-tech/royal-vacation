"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import type { GeniusLevelCreate, GeniusLevelUpdate } from "@royal-vacation/api-client";
import { api, callApi } from "@/lib/api";

const GENIUS_KEY = ["admin", "genius", "levels"] as const;

export function useGeniusLevels() {
  const query = useQuery({
    queryKey: GENIUS_KEY,
    queryFn: () => callApi(() => api.admin.genius.list()),
  });
  const qc = useQueryClient();

  const createLevel = useMutation({
    mutationFn: (body: GeniusLevelCreate) => callApi(() => api.admin.genius.create(body)),
    onSuccess: () => qc.invalidateQueries({ queryKey: GENIUS_KEY }),
  });
  const updateLevel = useMutation({
    mutationFn: ({ id, body }: { id: string; body: GeniusLevelUpdate }) =>
      callApi(() => api.admin.genius.update(id, body)),
    onSuccess: () => qc.invalidateQueries({ queryKey: GENIUS_KEY }),
  });
  const deleteLevel = useMutation({
    mutationFn: (id: string) => callApi(() => api.admin.genius.remove(id)),
    onSuccess: () => qc.invalidateQueries({ queryKey: GENIUS_KEY }),
  });

  return {
    levels: query.data ?? [],
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
    createLevel: (body: GeniusLevelCreate) => createLevel.mutateAsync(body),
    updateLevel: (id: string, body: GeniusLevelUpdate) => updateLevel.mutateAsync({ id, body }),
    deleteLevel: (id: string) => deleteLevel.mutateAsync(id),
    isMutating: createLevel.isPending || updateLevel.isPending || deleteLevel.isPending,
  };
}
