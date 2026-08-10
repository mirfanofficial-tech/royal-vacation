export interface AdminSession {
  name: string;
  email: string;
}

export function getToken(): string | undefined {
  if (typeof window === "undefined") return undefined;
  return window.localStorage.getItem("rv_admin_token") ?? undefined;
}

export function setToken(token: string): void {
  window.localStorage.setItem("rv_admin_token", token);
}

export function clearToken(): void {
  window.localStorage.removeItem("rv_admin_token");
}

export function isAuthenticated(): boolean {
  return Boolean(getToken());
}

export function getSession(): AdminSession | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem("rv_admin_session");
    return raw ? (JSON.parse(raw) as AdminSession) : null;
  } catch {
    return null;
  }
}

export function setSession(session: AdminSession): void {
  window.localStorage.setItem("rv_admin_session", JSON.stringify(session));
}

export function clearSession(): void {
  window.localStorage.removeItem("rv_admin_token");
  window.localStorage.removeItem("rv_admin_session");
}
