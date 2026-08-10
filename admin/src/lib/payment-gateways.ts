"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { mockPaymentGateways, type PaymentGateway } from "@/lib/mock-data";

const STORAGE_KEY = "rv_admin_settings_payment_gateways";

function load(): PaymentGateway[] {
  if (typeof window === "undefined") return mockPaymentGateways;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as PaymentGateway[]) : mockPaymentGateways;
  } catch {
    return mockPaymentGateways;
  }
}

export function usePaymentGateways() {
  const [gateways, setGateways] = useState<PaymentGateway[]>(mockPaymentGateways);
  const hydrated = useRef(false);

  useEffect(() => {
    if (!hydrated.current) {
      hydrated.current = true;
      setGateways(load());
    }
  }, []);

  useEffect(() => {
    if (hydrated.current) {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(gateways));
    }
  }, [gateways]);

  const setStatus = useCallback((id: string, status: PaymentGateway["status"]) => {
    setGateways((prev) => prev.map((g) => (g.id === id ? { ...g, status } : g)));
  }, []);

  const addGateway = useCallback(
    (gateway: PaymentGateway) => {
      setGateways((prev) => {
        const next = gateway.isDefault
          ? prev.map((g) => ({ ...g, isDefault: false }))
          : prev;
        return [...next, gateway];
      });
    },
    []
  );

  const updateGateway = useCallback(
    (id: string, patch: Partial<PaymentGateway>) => {
      setGateways((prev) =>
        prev.map((g) => (g.id === id ? { ...g, ...patch } : g))
      );
    },
    []
  );

  const setDefault = useCallback((id: string) => {
    setGateways((prev) =>
      prev.map((g) => ({
        ...g,
        isDefault: g.id === id,
        ...(g.id === id ? { status: "active" as const } : {}),
      }))
    );
  }, []);

  return { gateways, addGateway, updateGateway, setStatus, setDefault };
}
