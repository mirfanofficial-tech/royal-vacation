"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import type { PromoCodeCreate, PromoCodeUpdate } from "@royal-vacation/api-client";
import { api, callApi } from "@/lib/api";

const PROMO_CODES_KEY = ["admin", "payments", "promo-codes"] as const;

export function usePromoCodesQuery() {
  return useQuery({
    queryKey: PROMO_CODES_KEY,
    queryFn: () => callApi(() => api.admin.promoCodes.list()),
  });
}

export function usePromoCodes() {
  const query = usePromoCodesQuery();
  const qc = useQueryClient();
  const invalidate = () => qc.invalidateQueries({ queryKey: PROMO_CODES_KEY });

  const createPromoCode = useMutation({
    mutationFn: (body: PromoCodeCreate) =>
      callApi(() => api.admin.promoCodes.create(body)),
    onSuccess: invalidate,
  });
  const updatePromoCode = useMutation({
    mutationFn: ({ id, body }: { id: string; body: PromoCodeUpdate }) =>
      callApi(() => api.admin.promoCodes.update(id, body)),
    onSuccess: invalidate,
  });
  const deletePromoCode = useMutation({
    mutationFn: (id: string) => callApi(() => api.admin.promoCodes.remove(id)),
    onSuccess: invalidate,
  });

  return {
    promoCodes: query.data ?? [],
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
    createPromoCode: createPromoCode.mutateAsync,
    updatePromoCode: (id: string, body: PromoCodeUpdate) =>
      updatePromoCode.mutateAsync({ id, body }),
    deletePromoCode: deletePromoCode.mutateAsync,
    isMutating:
      createPromoCode.isPending ||
      updatePromoCode.isPending ||
      deletePromoCode.isPending,
  };
}
