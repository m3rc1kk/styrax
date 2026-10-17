import type { TokenResponse } from "./types";

export const API_URL = (import.meta.env.VITE_API_URL ?? "http://localhost:8000").replace(/\/+$/, "");

export class ApiError extends Error {
  readonly status: number;
  readonly detail: string | null;
  readonly fieldErrors: Record<string, string>;

  constructor(status: number, detail: string | null, fieldErrors: Record<string, string> = {}) {
    super(detail ?? `HTTP ${status}`);
    this.name = "ApiError";
    this.status = status;
    this.detail = detail;
    this.fieldErrors = fieldErrors;
  }
}

export class NetworkError extends Error {
  constructor(cause: unknown) {
    super("Network error", { cause });
    this.name = "NetworkError";
  }
}

let accessToken: string | null = null;
const tokenListeners = new Set<(token: string | null) => void>();

export function getAccessToken() {
  return accessToken;
}

export function setAccessToken(token: string | null) {
  accessToken = token;
  tokenListeners.forEach((listener) => listener(token));
}

export function onAccessTokenChange(listener: (token: string | null) => void) {
  tokenListeners.add(listener);
  return () => {
    tokenListeners.delete(listener);
  };
}

type RequestOptions = {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  json?: unknown;
  form?: Record<string, string>;
  signal?: AbortSignal;
};

const NO_REFRESH_PATHS = ["/auth/login", "/auth/refresh", "/auth/logout", "/auth/register"];

async function send(path: string, options: RequestOptions, token: string | null): Promise<Response> {
  const headers = new Headers();
  let body: BodyInit | undefined;

  if (options.json !== undefined) {
    headers.set("Content-Type", "application/json");
    body = JSON.stringify(options.json);
  } else if (options.form) {
    body = new URLSearchParams(options.form);
  }
  if (token) headers.set("Authorization", `Bearer ${token}`);

  try {
    return await fetch(`${API_URL}${path}`, {
      method: options.method ?? "GET",
      headers,
      body,
      signal: options.signal,
      credentials: path.startsWith("/auth/") ? "include" : "same-origin",
    });
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") throw error;
    throw new NetworkError(error);
  }
}

async function toApiError(response: Response): Promise<ApiError> {
  const payload: unknown = await response.json().catch(() => null);
  const detail = (payload as { detail?: unknown } | null)?.detail;

  if (Array.isArray(detail)) {
    const fieldErrors: Record<string, string> = {};
    for (const item of detail as { loc?: unknown[]; msg?: string }[]) {
      const field = String(item.loc?.[1] ?? item.loc?.[0] ?? "form");
      if (!(field in fieldErrors)) fieldErrors[field] = item.msg ?? "Неверное значение";
    }
    return new ApiError(response.status, null, fieldErrors);
  }
  return new ApiError(response.status, typeof detail === "string" ? detail : null);
}

async function parse<T>(response: Response): Promise<T> {
  if (response.status === 204) return undefined as T;
  const text = await response.text();
  return (text ? JSON.parse(text) : undefined) as T;
}

let refreshPromise: Promise<string | null> | null = null;

export function refreshAccessToken(): Promise<string | null> {
  if (!refreshPromise) {
    refreshPromise = (async () => {
      try {
        const response = await send("/auth/refresh", { method: "POST" }, null);
        if (!response.ok) {
          setAccessToken(null);
          return null;
        }
        const data = await parse<TokenResponse>(response);
        setAccessToken(data.access_token);
        return data.access_token;
      } finally {
        refreshPromise = null;
      }
    })();
  }
  return refreshPromise;
}

export async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  let response = await send(path, options, accessToken);

  if (response.status === 401 && !NO_REFRESH_PATHS.includes(path)) {
    const token = await refreshAccessToken();
    if (token) response = await send(path, options, token);
  }

  if (!response.ok) throw await toApiError(response);
  return parse<T>(response);
}

export function isApiError(error: unknown, status?: number): error is ApiError {
  return error instanceof ApiError && (status === undefined || error.status === status);
}
