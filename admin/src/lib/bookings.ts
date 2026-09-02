"use client";

import { useMemo } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import type { AdminBookingRefundRequest, BookingOut } from "@royal-vacation/api-client";
import { api, callApi } from "@/lib/api";

const BOOKINGS_KEY = ["admin", "bookings"] as const;

export type AdminBookingListParams = { status?: string; limit?: number; offset?: number };

export function useAdminBookingsQuery(params: AdminBookingListParams = {}) {
  return useQuery({
    queryKey: [...BOOKINGS_KEY, params] as const,
    queryFn: () => callApi(() => api.admin.bookings.list(params)),
  });
}

/** Aggregate figures the dashboard + bookings screen show. */
export function summariseBookings(rows: BookingOut[]) {
  const by = (s: string) => rows.filter((b) => b.status === s).length;
  const revenue = rows
    .filter((b) => b.status !== "cancelled")
    .reduce((sum, b) => sum + Number(b.total_amount || 0), 0);
  const cancelled = by("cancelled");
  return {
    total: rows.length,
    confirmed: by("confirmed"),
    pending: by("pending"),
    completed: by("completed"),
    cancelled,
    noShow: by("no_show"),
    revenue,
    currency: rows[0]?.currency ?? "AED",
    cancellationRate: rows.length ? (cancelled / rows.length) * 100 : 0,
  };
}

export function useAdminBookings(params: AdminBookingListParams = {}) {
  const query = useAdminBookingsQuery(params);
  const qc = useQueryClient();

  const invalidate = () => qc.invalidateQueries({ queryKey: BOOKINGS_KEY });

  const capture = useMutation({
    mutationFn: (id: string) => callApi(() => api.admin.bookings.capture(id)),
    onSuccess: invalidate,
  });
  const refund = useMutation({
    mutationFn: ({ id, body }: { id: string; body?: AdminBookingRefundRequest }) =>
      callApi(() => api.admin.bookings.refund(id, body ?? {})),
    onSuccess: invalidate,
  });

  const rows = useMemo(() => query.data ?? [], [query.data]);
  const summary = useMemo(() => summariseBookings(rows), [rows]);

  return {
    bookings: rows,
    summary,
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
    capturePayment: (id: string) => capture.mutateAsync(id),
    refundPayment: (id: string, body?: AdminBookingRefundRequest) =>
      refund.mutateAsync({ id, body }),
    isMutating: capture.isPending || refund.isPending,
  };
}
