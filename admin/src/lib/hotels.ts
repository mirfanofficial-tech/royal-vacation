"use client";

import { useQuery } from "@tanstack/react-query";

import { api, callApi } from "@/lib/api";

export function useHotelsQuery() {
  return useQuery({
    queryKey: ["admin", "hotels"],
    queryFn: () => callApi(() => api.admin.hotels.list()),
  });
}

export function useHotelPipelineStatsQuery() {
  return useQuery({
    queryKey: ["admin", "hotels", "stats"],
    queryFn: () => callApi(() => api.admin.hotels.stats()),
  });
}
