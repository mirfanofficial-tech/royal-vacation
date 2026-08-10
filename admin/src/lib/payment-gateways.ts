"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import type { PaymentGatewayCreate, PaymentGatewayUpdate } from "@royal-vacation/api-client";
import { api, callApi } from "@/lib/api";

const PAYMENT_GATEWAYS_KEY = ["admin", "payment-gateways"] as const;

export function usePaymentGatewaysQuery() {
  return useQuery({
    queryKey: PAYMENT_GATEWAYS_KEY,
    queryFn: () => callApi(() => api.admin.paymentGateways.list()),
  });
}

export function usePaymentGateways() {
  const query = usePaymentGatewaysQuery();
  const qc = useQueryClient();
  const invalidate = () => qc.invalidateQueries({ queryKey: PAYMENT_GATEWAYS_KEY });

  const createGateway = useMutation({
    mutationFn: (body: PaymentGatewayCreate) =>
      callApi(() => api.admin.paymentGateways.create(body)),
    onSuccess: invalidate,
  });
  const updateGateway = useMutation({
    mutationFn: ({ id, body }: { id: string; body: PaymentGatewayUpdate }) =>
      callApi(() => api.admin.paymentGateways.update(id, body)),
    onSuccess: invalidate,
  });
  const deleteGateway = useMutation({
    mutationFn: (id: string) => callApi(() => api.admin.paymentGateways.remove(id)),
    onSuccess: invalidate,
  });
  const setDefaultGateway = useMutation({
    mutationFn: (id: string) => callApi(() => api.admin.paymentGateways.setDefault(id)),
    onSuccess: invalidate,
  });

  return {
    gateways: query.data ?? [],
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
    createGateway: createGateway.mutateAsync,
    updateGateway: (id: string, body: PaymentGatewayUpdate) =>
      updateGateway.mutateAsync({ id, body }),
    deleteGateway: deleteGateway.mutateAsync,
    setDefaultGateway: setDefaultGateway.mutateAsync,
    isMutating:
      createGateway.isPending ||
      updateGateway.isPending ||
      deleteGateway.isPending ||
      setDefaultGateway.isPending,
  };
}
