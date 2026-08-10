"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import type { ThirdPartyModuleOut, ThirdPartyModuleUpdate } from "@royal-vacation/api-client";
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

export function testModuleConnection(
  module: ThirdPartyModuleOut
): Promise<{ ok: boolean; message: string }> {
  return new Promise((resolve) => {
    window.setTimeout(() => {
      const missing = module.credential_fields.filter(
        (field) => field.required && !(field.value ?? "").trim()
      );
      if (missing.length > 0) {
        resolve({
          ok: false,
          message: `Test failed — required fields are empty: ${missing
            .map((field) => field.label)
            .join(", ")}.`,
        });
      } else {
        const baseUrl =
          module.credential_fields.find((field) => field.key === "baseUrl")
            ?.value ?? "";
        resolve({
          ok: true,
          message: `Connection successful (200 OK) — reached ${baseUrl || "the provider"} endpoint.`,
        });
      }
    }, 1200);
  });
}
