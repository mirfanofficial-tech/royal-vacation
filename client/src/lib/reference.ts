"use client";

import { useQuery } from "@tanstack/react-query";

import { api } from "@/lib/api";

export function useCurrenciesQuery() {
  return useQuery({
    queryKey: ["reference", "currencies"],
    queryFn: () => api.reference.currencies(),
  });
}

export function useLanguagesQuery() {
  return useQuery({
    queryKey: ["reference", "languages"],
    queryFn: () => api.reference.languages(),
  });
}
