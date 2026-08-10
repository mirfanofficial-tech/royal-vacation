export interface RequestOptions {
  method?: string;
  query?: Record<string, string | number | boolean | undefined>;
  body?: unknown;
  headers?: Record<string, string>;
  signal?: AbortSignal;
  /** Whether to send credentials (cookies) with the request. Defaults to false. */
  credentials?: RequestCredentials;
}

export class ApiError extends Error {
  readonly status: number;
  readonly body: unknown;

  constructor(status: number, body: unknown) {
    const message =
      typeof body === "object" &&
      body !== null &&
      "detail" in body &&
      typeof (body as { detail: unknown }).detail === "string"
        ? (body as { detail: string }).detail
        : `Request failed with status ${status}`;
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.body = body;
  }
}

export interface ApiClientOptions {
  baseUrl: string;
  getToken?: () => string | undefined;
  fetch?: typeof fetch;
}

/**
 * Minimal typed HTTP client for the FastAPI backend.
 * Every app (client & admin) talks to the backend through this class so
 * endpoint contracts live in one place.
 */
export class ApiClient {
  readonly baseUrl: string;
  private readonly getToken: () => string | undefined;
  private readonly fetchImpl: typeof fetch;

  constructor({ baseUrl, getToken, fetch: fetchImpl }: ApiClientOptions) {
    this.baseUrl = baseUrl.replace(/\/+$/, "");
    this.getToken = getToken ?? (() => undefined);
    // globalThis.fetch requires `this === globalThis` when invoked in
    // browsers ("Illegal invocation" otherwise) — bind it since we always
    // call it as `this.fetchImpl(...)`.
    this.fetchImpl = fetchImpl ?? globalThis.fetch.bind(globalThis);
  }

  async request<T>(path: string, options: RequestOptions = {}): Promise<T> {
    const { method = "GET", query, body, headers, signal, credentials } = options;

    const url = new URL(`${this.baseUrl}${path}`);
    if (query) {
      for (const [key, value] of Object.entries(query)) {
        if (value !== undefined) url.searchParams.set(key, String(value));
      }
    }

    const token = this.getToken();
    const response = await this.fetchImpl(url.toString(), {
      method,
      signal,
      credentials,
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...headers,
      },
      body: body === undefined ? undefined : JSON.stringify(body),
    });

    if (!response.ok) {
      let errorBody: unknown;
      try {
        errorBody = await response.json();
      } catch {
        errorBody = await response.text().catch(() => undefined);
      }
      throw new ApiError(response.status, errorBody);
    }

    if (response.status === 204) {
      return undefined as T;
    }

    return (await response.json()) as T;
  }

  get<T>(path: string, options: Omit<RequestOptions, "method" | "body"> = {}) {
    return this.request<T>(path, { ...options, method: "GET" });
  }

  post<T>(path: string, body?: unknown, options: Omit<RequestOptions, "method" | "body"> = {}) {
    return this.request<T>(path, { ...options, method: "POST", body });
  }

  put<T>(path: string, body?: unknown, options: Omit<RequestOptions, "method" | "body"> = {}) {
    return this.request<T>(path, { ...options, method: "PUT", body });
  }

  patch<T>(path: string, body?: unknown, options: Omit<RequestOptions, "method" | "body"> = {}) {
    return this.request<T>(path, { ...options, method: "PATCH", body });
  }

  delete<T>(path: string, options: Omit<RequestOptions, "method" | "body"> = {}) {
    return this.request<T>(path, { ...options, method: "DELETE" });
  }
}
