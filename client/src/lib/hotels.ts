"use client";

import { useQuery } from "@tanstack/react-query";

import { api } from "@/lib/api";

export function useHotelsQuery() {
  return useQuery({
    queryKey: ["hotels"],
    queryFn: () => api.hotels.list(),
  });
}
