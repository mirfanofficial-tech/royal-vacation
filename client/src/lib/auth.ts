import type { AccountType, UserOut } from "@royal-vacation/api-client";

export interface ClientSession {
  id: string;
  name: string;
  email: string;
  accountType: AccountType;
}

const ACCESS_TOKEN_KEY = "rv_client_access_token";
const REFRESH_TOKEN_KEY = "rv_client_refresh_token";
const SESSION_KEY = "rv_client_session";

export function userToSession(user: UserOut): ClientSession {
  return {
    id: user.id,
    name:
      user.display_name ||
      [user.first_name, user.last_name].filter(Boolean).join(" ") ||
      user.email,
    email: user.email,
    accountType: user.account_type,
  };
}

export function getAccessToken(): string | undefined {
  if (typeof window === "undefined") return undefined;
  return window.localStorage.getItem(ACCESS_TOKEN_KEY) ?? undefined;
}

export function getRefreshToken(): string | undefined {
  if (typeof window === "undefined") return undefined;
  return window.localStorage.getItem(REFRESH_TOKEN_KEY) ?? undefined;
}

export function setTokens(accessToken: string, refreshToken: string): void {
  window.localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
  window.localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
}

export function isAuthenticated(): boolean {
  return Boolean(getAccessToken());
}

export function getSession(): ClientSession | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(SESSION_KEY);
    return raw ? (JSON.parse(raw) as ClientSession) : null;
  } catch {
    return null;
  }
}

export function setSession(session: ClientSession): void {
  window.localStorage.setItem(SESSION_KEY, JSON.stringify(session));
}

export function clearSession(): void {
  window.localStorage.removeItem(ACCESS_TOKEN_KEY);
  window.localStorage.removeItem(REFRESH_TOKEN_KEY);
  window.localStorage.removeItem(SESSION_KEY);
}
