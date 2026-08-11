"use client";

import { useQuery } from "@tanstack/react-query";

import { api } from "@/lib/api";

export function usePropertyTypesQuery() {
  return useQuery({
    queryKey: ["property-types"],
    queryFn: () => api.propertyTypes.list(),
  });
}
