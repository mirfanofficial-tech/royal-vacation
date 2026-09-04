import { ApiError, RoyalVacationApi } from "@royal-vacation/api-client";
import type {
  BookingCancelRequest,
  BookingCreate,
  OtpRequestInput,
  OtpVerifyInput,
  RegisterRequest,
} from "@royal-vacation/api-client";

import {
  clearSession,
  getAccessToken,
  getRefreshToken,
  setSession,
  setTokens,
  userToSession,
} from "@/lib/auth";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

export const api = new RoyalVacationApi({
  baseUrl: API_BASE_URL,
  getToken: getAccessToken,
});

/**
 * Resolves a backend-relative asset path (e.g. an uploaded image's
 * `/static/uploads/...` URL) against the API origin — otherwise the browser
 * resolves it against this app's own origin instead of the backend's.
 * Absolute URLs pass through unchanged.
 */
export function resolveAssetUrl(path: string): string {
  return /^https?:\/\//.test(path) ? path : `${API_BASE_URL}${path}`;
}

async function login(email: string, password: string) {
  const res = await api.auth.login({ email, password });
  setTokens(res.access_token, res.refresh_token);
  setSession(userToSession(res.user));
  return res.user;
}

async function register(body: RegisterRequest) {
  const res = await api.auth.register(body);
  setTokens(res.access_token, res.refresh_token);
  setSession(userToSession(res.user));
  return res.user;
}

async function loginWithGoogle(accessToken: string) {
  const res = await api.auth.google({ access_token: accessToken });
  setTokens(res.access_token, res.refresh_token);
  setSession(userToSession(res.user));
  return res.user;
}

async function loginWithFacebook(accessToken: string) {
  const res = await api.auth.facebook({ access_token: accessToken });
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

// ---- Bookings (guest checkout, Stripe) ---------------------------------

const bookings = {
  create: (body: BookingCreate) => callApi(() => api.bookings.create(body)),
  get: (id: string, token?: string) => callApi(() => api.bookings.get(id, token)),
  sync: (id: string, token?: string) => callApi(() => api.bookings.sync(id, token)),
  list: () => callApi(() => api.bookings.list()),
  cancel: (id: string, body: BookingCancelRequest = {}, token?: string) =>
    callApi(() => api.bookings.cancel(id, body, token)),
};

// ---- Email OTP (checkout verification / passwordless sign-in) -----------

async function requestOtp(body: OtpRequestInput) {
  return callApi(() => api.auth.otpRequest(body));
}

/** Verifies the code, then stores the returned session. */
async function verifyOtp(body: OtpVerifyInput) {
  const res = await api.auth.otpVerify(body);
  setTokens(res.access_token, res.refresh_token);
  setSession(userToSession(res.user));
  return res;
}

// ---- Forgot password (request token + confirm reset) ----------------------

async function requestPasswordReset(email: string) {
  return callApi(() => api.auth.resetPassword({ email }));
}

async function confirmPasswordReset(token: string, newPassword: string) {
  return callApi(() => api.auth.confirmReset({ token, new_password: newPassword }));
}

export {
  ApiError,
  login,
  register,
  loginWithGoogle,
  loginWithFacebook,
  logout,
  bookings,
  requestOtp,
  verifyOtp,
  requestPasswordReset,
  confirmPasswordReset,
};
