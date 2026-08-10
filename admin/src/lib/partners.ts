"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import type { PartnerListParams } from "@royal-vacation/api-client";
import { api, callApi } from "@/lib/api";

const PARTNERS_KEY = ["admin", "partners"] as const;

export function usePartnersQuery(params: PartnerListParams = {}) {
  return useQuery({
    queryKey: [...PARTNERS_KEY, params],
    queryFn: () => callApi(() => api.admin.partners.list(params)),
  });
}

export function useVerifyPartner() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (userId: string) => callApi(() => api.admin.partners.verify(userId)),
    onSuccess: () => qc.invalidateQueries({ queryKey: PARTNERS_KEY }),
  });
}
