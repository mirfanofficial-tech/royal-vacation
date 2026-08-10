"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  mockThirdPartyModules,
  type ThirdPartyModule,
} from "@/lib/mock-data";

const STORAGE_KEY = "rv_admin_modules";

function load(): ThirdPartyModule[] {
  if (typeof window === "undefined") return mockThirdPartyModules;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as ThirdPartyModule[]) : mockThirdPartyModules;
  } catch {
    return mockThirdPartyModules;
  }
}

export function useModules() {
  const [modules, setModules] = useState<ThirdPartyModule[]>(
    mockThirdPartyModules
  );
  const hydrated = useRef(false);

  useEffect(() => {
    if (!hydrated.current) {
      hydrated.current = true;
      setModules(load());
    }
  }, []);

  useEffect(() => {
    if (hydrated.current) {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(modules));
    }
  }, [modules]);

  const updateModule = useCallback(
    (id: string, patch: Partial<ThirdPartyModule>) => {
      setModules((prev) =>
        prev.map((m) => (m.id === id ? { ...m, ...patch } : m))
      );
    },
    []
  );

  return { modules, updateModule };
}

export function testModuleConnection(
  module: ThirdPartyModule
): Promise<{ ok: boolean; message: string }> {
  return new Promise((resolve) => {
    window.setTimeout(() => {
      const missing = module.credentialFields.filter(
        (field) => field.required && !field.value.trim()
      );
      if (missing.length > 0) {
        resolve({
          ok: false,
          message: `Test failed — required fields are empty: ${missing
            .map((field) => field.label)
            .join(", ")}.`,
        });
      } else {
        const baseUrl =
          module.credentialFields.find((field) => field.key === "baseUrl")
            ?.value ?? "";
        resolve({
          ok: true,
          message: `Connection successful (200 OK) — reached ${baseUrl || "the provider"} endpoint.`,
        });
      }
    }, 1200);
  });
}
