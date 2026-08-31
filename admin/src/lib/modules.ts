"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import type {
  ModuleTestConnectionResult,
  ThirdPartyModuleCreate,
  ThirdPartyModuleOut,
  ThirdPartyModuleUpdate,
} from "@royal-vacation/api-client";
import { api, callApi } from "@/lib/api";

const MODULES_KEY = ["admin", "modules"] as const;

export function useModulesQuery() {
  return useQuery({
    queryKey: MODULES_KEY,
    queryFn: () => callApi(() => api.admin.modules.list()),
  });
}

export function useModules() {
  const query = useModulesQuery();
  const qc = useQueryClient();

  const createModule = useMutation({
    mutationFn: (body: ThirdPartyModuleCreate) =>
      callApi(() => api.admin.modules.create(body)),
    onSuccess: (created: ThirdPartyModuleOut) =>
      qc.setQueryData<ThirdPartyModuleOut[]>(MODULES_KEY, (prev) =>
        prev ? [...prev, created] : [created]
      ),
  });

  const updateModule = useMutation({
    mutationFn: ({ id, body }: { id: string; body: ThirdPartyModuleUpdate }) =>
      callApi(() => api.admin.modules.update(id, body)),
    onSuccess: () => qc.invalidateQueries({ queryKey: MODULES_KEY }),
  });

  const deleteModule = useMutation({
    mutationFn: (id: string) => callApi(() => api.admin.modules.remove(id)),
    onSuccess: (_data, id) =>
      qc.setQueryData<ThirdPartyModuleOut[]>(MODULES_KEY, (prev) =>
        prev?.filter((m) => m.id !== id)
      ),
  });

  return {
    modules: query.data ?? [],
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
    createModule: (body: ThirdPartyModuleCreate) => createModule.mutateAsync(body),
    isCreating: createModule.isPending,
    updateModule: (id: string, body: ThirdPartyModuleUpdate) =>
      updateModule.mutateAsync({ id, body }),
    isMutating: updateModule.isPending,
    deleteModule: (id: string) => deleteModule.mutateAsync(id),
    isDeleting: deleteModule.isPending,
  };
}

export function testModuleConnection(moduleId: string): Promise<ModuleTestConnectionResult> {
  return callApi(() => api.admin.modules.testConnection(moduleId));
}
