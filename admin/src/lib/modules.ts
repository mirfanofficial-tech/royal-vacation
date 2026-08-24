"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import type {
  ModuleTestConnectionResult,
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

  const updateModule = useMutation({
    mutationFn: ({ id, body }: { id: string; body: ThirdPartyModuleUpdate }) =>
      callApi(() => api.admin.modules.update(id, body)),
    onSuccess: () => qc.invalidateQueries({ queryKey: MODULES_KEY }),
  });

  return {
    modules: query.data ?? [],
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
    updateModule: (id: string, body: ThirdPartyModuleUpdate) =>
      updateModule.mutateAsync({ id, body }),
    isMutating: updateModule.isPending,
  };
}

export function testModuleConnection(moduleId: string): Promise<ModuleTestConnectionResult> {
  return callApi(() => api.admin.modules.testConnection(moduleId));
}
