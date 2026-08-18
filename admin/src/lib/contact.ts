"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import type { ContactMessageStatus } from "@royal-vacation/api-client";
import { api, callApi } from "@/lib/api";

const CONTACT_MESSAGES_KEY = ["admin", "contact", "messages"] as const;

export interface ContactMessageFilters {
  status?: string;
  topic?: string;
}

export function useContactMessagesQuery(filters: ContactMessageFilters = {}) {
  return useQuery({
    queryKey: [...CONTACT_MESSAGES_KEY, filters],
    queryFn: () => callApi(() => api.admin.contact.list(filters)),
  });
}

export function useContactMessages(filters: ContactMessageFilters = {}) {
  const query = useContactMessagesQuery(filters);
  const qc = useQueryClient();

  const updateStatus = useMutation({
    mutationFn: ({ id, status }: { id: string; status: ContactMessageStatus }) =>
      callApi(() => api.admin.contact.updateStatus(id, { status })),
    onSuccess: () => qc.invalidateQueries({ queryKey: CONTACT_MESSAGES_KEY }),
  });

  return {
    messages: query.data ?? [],
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
    updateStatus: (id: string, status: ContactMessageStatus) =>
      updateStatus.mutateAsync({ id, status }),
    isMutating: updateStatus.isPending,
  };
}
