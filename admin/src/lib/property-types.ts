"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import type { PropertyTypeCreate, PropertyTypeUpdate } from "@royal-vacation/api-client";
import { api, callApi } from "@/lib/api";

const PROPERTY_TYPES_KEY = ["admin", "stays", "property-types"] as const;

export function usePropertyTypesQuery() {
  return useQuery({
    queryKey: PROPERTY_TYPES_KEY,
    queryFn: () => callApi(() => api.admin.stays.propertyTypes.list()),
  });
}

export function usePropertyTypes() {
  const query = usePropertyTypesQuery();
  const qc = useQueryClient();
  const invalidate = () => qc.invalidateQueries({ queryKey: PROPERTY_TYPES_KEY });

  const createPropertyType = useMutation({
    mutationFn: (body: PropertyTypeCreate) =>
      callApi(() => api.admin.stays.propertyTypes.create(body)),
    onSuccess: invalidate,
  });
  const updatePropertyType = useMutation({
    mutationFn: ({ id, body }: { id: string; body: PropertyTypeUpdate }) =>
      callApi(() => api.admin.stays.propertyTypes.update(id, body)),
    onSuccess: invalidate,
  });
  const deletePropertyType = useMutation({
    mutationFn: (id: string) => callApi(() => api.admin.stays.propertyTypes.remove(id)),
    onSuccess: invalidate,
  });
  const uploadImage = useMutation({
    mutationFn: ({ id, file }: { id: string; file: File }) =>
      callApi(() => api.admin.stays.propertyTypes.uploadImage(id, file)),
    onSuccess: invalidate,
  });

  return {
    propertyTypes: query.data ?? [],
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
    createPropertyType: createPropertyType.mutateAsync,
    updatePropertyType: (id: string, body: PropertyTypeUpdate) =>
      updatePropertyType.mutateAsync({ id, body }),
    deletePropertyType: deletePropertyType.mutateAsync,
    uploadImage: (id: string, file: File) => uploadImage.mutateAsync({ id, file }),
    isMutating:
      createPropertyType.isPending ||
      updatePropertyType.isPending ||
      deletePropertyType.isPending ||
      uploadImage.isPending,
  };
}
