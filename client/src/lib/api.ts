import { RoyalVacationApi } from "@royal-vacation/api-client";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

export const api = new RoyalVacationApi({
  baseUrl: API_BASE_URL,
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
