"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import type {
  StaySettingCreate,
  StaySettingType,
  StaySettingUpdate,
} from "@royal-vacation/api-client";
import { api, callApi } from "@/lib/api";

const STAY_SETTINGS_KEY = ["admin", "stays", "settings"] as const;

export const staySettingTypes: { value: StaySettingType; label: string }[] = [
  { value: "stay_amenity", label: "Stay Amenity" },
  { value: "room_type", label: "Room Type" },
  { value: "room_amenity", label: "Room Amenity" },
  { value: "accommodation", label: "Accommodation" },
  { value: "board", label: "Boards" },
];

export function useStaySettingsQuery(settingType?: StaySettingType) {
  return useQuery({
    queryKey: [...STAY_SETTINGS_KEY, settingType ?? "all"],
    queryFn: () => callApi(() => api.admin.stays.list(settingType)),
  });
}

export function useStaySettings(settingType?: StaySettingType) {
  const query = useStaySettingsQuery(settingType);
  const qc = useQueryClient();
  const invalidate = () => qc.invalidateQueries({ queryKey: STAY_SETTINGS_KEY });

  const createSetting = useMutation({
    mutationFn: (body: StaySettingCreate) => callApi(() => api.admin.stays.create(body)),
    onSuccess: invalidate,
  });
  const updateSetting = useMutation({
    mutationFn: ({ id, body }: { id: string; body: StaySettingUpdate }) =>
      callApi(() => api.admin.stays.update(id, body)),
    onSuccess: invalidate,
  });
  const deleteSetting = useMutation({
    mutationFn: (id: string) => callApi(() => api.admin.stays.remove(id)),
    onSuccess: invalidate,
  });

  return {
    settings: query.data ?? [],
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
    createSetting: createSetting.mutateAsync,
    updateSetting: (id: string, body: StaySettingUpdate) =>
      updateSetting.mutateAsync({ id, body }),
    deleteSetting: deleteSetting.mutateAsync,
    isMutating: createSetting.isPending || updateSetting.isPending || deleteSetting.isPending,
  };
}
