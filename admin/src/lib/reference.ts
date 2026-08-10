"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import type {
  CountryCreate,
  CountryUpdate,
  CurrencyCreate,
  CurrencyUpdate,
  LanguageCreate,
  LanguageUpdate,
} from "@royal-vacation/api-client";
import { api, callApi } from "@/lib/api";

const CURRENCIES_KEY = ["admin", "reference", "currencies"] as const;
const LANGUAGES_KEY = ["admin", "reference", "languages"] as const;
const COUNTRIES_KEY = ["admin", "reference", "countries"] as const;

function mutateAsyncFn<TVars, TData>(mutation: { mutateAsync: (vars: TVars) => Promise<TData> }) {
  return mutation.mutateAsync;
}

// ---- Currencies -------------------------------------------------------

export function useCurrenciesQuery() {
  return useQuery({
    queryKey: CURRENCIES_KEY,
    queryFn: () => callApi(() => api.admin.reference.currencies.list()),
  });
}

export function useCurrencies() {
  const query = useCurrenciesQuery();
  const qc = useQueryClient();

  const createCurrency = useMutation({
    mutationFn: (body: CurrencyCreate) =>
      callApi(() => api.admin.reference.currencies.create(body)),
    onSuccess: () => qc.invalidateQueries({ queryKey: CURRENCIES_KEY }),
  });
  const updateCurrency = useMutation({
    mutationFn: ({ id, body }: { id: string; body: CurrencyUpdate }) =>
      callApi(() => api.admin.reference.currencies.update(id, body)),
    onSuccess: () => qc.invalidateQueries({ queryKey: CURRENCIES_KEY }),
  });
  const deleteCurrency = useMutation({
    mutationFn: (id: string) => callApi(() => api.admin.reference.currencies.remove(id)),
    onSuccess: () => qc.invalidateQueries({ queryKey: CURRENCIES_KEY }),
  });

  return {
    currencies: query.data ?? [],
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
    createCurrency: mutateAsyncFn(createCurrency),
    updateCurrency: (id: string, body: CurrencyUpdate) =>
      updateCurrency.mutateAsync({ id, body }),
    deleteCurrency: mutateAsyncFn(deleteCurrency),
    isMutating: createCurrency.isPending || updateCurrency.isPending || deleteCurrency.isPending,
  };
}

// ---- Languages ----------------------------------------------------------

export function useLanguagesQuery() {
  return useQuery({
    queryKey: LANGUAGES_KEY,
    queryFn: () => callApi(() => api.admin.reference.languages.list()),
  });
}

export function useLanguages() {
  const query = useLanguagesQuery();
  const qc = useQueryClient();

  const createLanguage = useMutation({
    mutationFn: (body: LanguageCreate) =>
      callApi(() => api.admin.reference.languages.create(body)),
    onSuccess: () => qc.invalidateQueries({ queryKey: LANGUAGES_KEY }),
  });
  const updateLanguage = useMutation({
    mutationFn: ({ id, body }: { id: string; body: LanguageUpdate }) =>
      callApi(() => api.admin.reference.languages.update(id, body)),
    onSuccess: () => qc.invalidateQueries({ queryKey: LANGUAGES_KEY }),
  });
  const deleteLanguage = useMutation({
    mutationFn: (id: string) => callApi(() => api.admin.reference.languages.remove(id)),
    onSuccess: () => qc.invalidateQueries({ queryKey: LANGUAGES_KEY }),
  });

  return {
    languages: query.data ?? [],
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
    createLanguage: mutateAsyncFn(createLanguage),
    updateLanguage: (id: string, body: LanguageUpdate) =>
      updateLanguage.mutateAsync({ id, body }),
    deleteLanguage: mutateAsyncFn(deleteLanguage),
    isMutating: createLanguage.isPending || updateLanguage.isPending || deleteLanguage.isPending,
  };
}

// ---- Countries ----------------------------------------------------------

export function useCountriesQuery() {
  return useQuery({
    queryKey: COUNTRIES_KEY,
    queryFn: () => callApi(() => api.admin.reference.countries.list()),
  });
}

export function useCountries() {
  const query = useCountriesQuery();
  const qc = useQueryClient();

  const createCountry = useMutation({
    mutationFn: (body: CountryCreate) =>
      callApi(() => api.admin.reference.countries.create(body)),
    onSuccess: () => qc.invalidateQueries({ queryKey: COUNTRIES_KEY }),
  });
  const updateCountry = useMutation({
    mutationFn: ({ id, body }: { id: string; body: CountryUpdate }) =>
      callApi(() => api.admin.reference.countries.update(id, body)),
    onSuccess: () => qc.invalidateQueries({ queryKey: COUNTRIES_KEY }),
  });
  const deleteCountry = useMutation({
    mutationFn: (id: string) => callApi(() => api.admin.reference.countries.remove(id)),
    onSuccess: () => qc.invalidateQueries({ queryKey: COUNTRIES_KEY }),
  });

  return {
    countries: query.data ?? [],
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
    createCountry: mutateAsyncFn(createCountry),
    updateCountry: (id: string, body: CountryUpdate) =>
      updateCountry.mutateAsync({ id, body }),
    deleteCountry: mutateAsyncFn(deleteCountry),
    isMutating: createCountry.isPending || updateCountry.isPending || deleteCountry.isPending,
  };
}
