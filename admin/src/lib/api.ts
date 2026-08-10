import { ApiError, RoyalVacationApi } from "@royal-vacation/api-client";

import {
  clearSession,
  getAccessToken,
  getRefreshToken,
  setSession,
  setTokens,
  userToSession,
} from "@/lib/auth";

export const api = new RoyalVacationApi({
  baseUrl: process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000",
  getToken: getAccessToken,
});

async function login(email: string, password: string) {
  const res = await api.auth.login({ email, password });
  setTokens(res.access_token, res.refresh_token);
  setSession(userToSession(res.user));
  return res.user;
}

async function logout() {
  const refreshToken = getRefreshToken();
  clearSession();
  if (refreshToken) {
    // Best-effort server-side revocation — the local session is already gone
    // either way, so a failure here (e.g. offline) shouldn't block sign-out.
    await api.auth.logout({ refresh_token: refreshToken }).catch(() => undefined);
  }
}

let refreshInFlight: Promise<boolean> | null = null;

async function refreshTokens(): Promise<boolean> {
  const refreshToken = getRefreshToken();
  if (!refreshToken) return false;
  try {
    const tokens = await api.auth.refreshToken({ refresh_token: refreshToken });
    setTokens(tokens.access_token, tokens.refresh_token);
    return true;
  } catch {
    return false;
  }
}

/**
 * Runs an API call, transparently refreshing the access token and retrying
 * once on a 401. Concurrent 401s share a single in-flight refresh instead of
 * each racing their own. On refresh failure the local session is cleared and
 * the original 401 propagates so the caller can redirect to /login.
 */
export async function callApi<T>(fn: () => Promise<T>): Promise<T> {
  try {
    return await fn();
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) {
      refreshInFlight ??= refreshTokens().finally(() => {
        refreshInFlight = null;
      });
      if (await refreshInFlight) {
        return fn();
      }
      clearSession();
    }
    throw error;
  }
}

export { ApiError, login, logout };
