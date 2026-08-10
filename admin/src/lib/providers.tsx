"use client";

import { useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import { ApiError } from "@/lib/api";

function shouldRetry(failureCount: number, error: unknown) {
  // 4xx errors (bad input, forbidden, not found, etc.) won't succeed on retry.
  if (error instanceof ApiError && error.status >= 400 && error.status < 500) {
    return false;
  }
  return failureCount < 2;
}

export function Providers({ children }: { children: React.ReactNode }) {
  const [client] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: { retry: shouldRetry, staleTime: 30_000 },
          mutations: { retry: false },
        },
      })
  );

  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}
