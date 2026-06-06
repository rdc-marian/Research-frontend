import Cookies from "js-cookie";

export type ApiListResponse<T> = {
  items: T[];
};

export type ApiItemResponse<T> = {
  item: T;
};

export type ApiMessageResponse = {
  message: string;
};

const getAuthHeaders = (): Record<string, string> => {
  const token = typeof window !== "undefined" ? Cookies.get("token") : undefined;
  return token ? { Authorization: `Bearer ${token}` } : {};
};

const isProduction = process.env.NODE_ENV === "production";
const rawBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
const fallbackBaseUrl = isProduction ? undefined : "http://localhost:5002/api";
const resolvedBaseUrl = (rawBaseUrl ?? fallbackBaseUrl)?.replace(/\/$/, "");

if (!resolvedBaseUrl) {
  throw new Error("NEXT_PUBLIC_API_BASE_URL is required in production builds.");
}

if (typeof window === "undefined") {
  console.log(`[api] Resolved API base URL: ${resolvedBaseUrl}`);
}

export const API_BASE_URL = resolvedBaseUrl;

const buildUrl = (path: string) => {
  const safePath = path.startsWith("/") ? path : `/${path}`;
  return `${API_BASE_URL}${safePath}`;
};

const readErrorMessage = async (response: Response) => {
  try {
    const data = (await response.json()) as { message?: string };
    if (data?.message) return data.message;
  } catch {
    // Ignore JSON parse errors and fall back to status text.
  }

  return `${response.status} ${response.statusText}`.trim();
};

export const apiGet = async <T>(path: string, init?: RequestInit): Promise<T> => {
  const response = await fetch(buildUrl(path), {
    ...init,
    method: "GET",
    headers: {
      Accept: "application/json",
      ...getAuthHeaders(),
      ...(init?.headers ?? {}),
    },
  });

  if (!response.ok) {
    const message = await readErrorMessage(response);
    throw new Error(message || "Request failed");
  }

  return (await response.json()) as T;
};

export const apiPostJson = async <
  TResponse,
  TBody extends Record<string, unknown> = Record<string, unknown>
>(
  path: string,
  body: TBody
): Promise<TResponse> => {
  const response = await fetch(buildUrl(path), {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      ...getAuthHeaders(),
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const message = await readErrorMessage(response);
    throw new Error(message || "Request failed");
  }

  return (await response.json()) as TResponse;
};

export const apiPatchJson = async <
  TResponse,
  TBody extends Record<string, unknown> = Record<string, unknown>
>(
  path: string,
  body: TBody,
  init?: RequestInit
): Promise<TResponse> => {
  const response = await fetch(buildUrl(path), {
    ...init,
    method: "PATCH",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      ...getAuthHeaders(),
      ...(init?.headers ?? {}),
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const message = await readErrorMessage(response);
    throw new Error(message || "Request failed");
  }

  return (await response.json()) as TResponse;
};

export const apiPostForm = async <T>(path: string, body: FormData): Promise<T> => {
  const response = await fetch(buildUrl(path), {
    method: "POST",
    headers: {
      Accept: "application/json",
      ...getAuthHeaders(),
    },
    body,
  });

  if (!response.ok) {
    const message = await readErrorMessage(response);
    throw new Error(message || "Request failed");
  }

  return (await response.json()) as T;
};

export const apiPatchForm = async <T>(path: string, body: FormData): Promise<T> => {
  const response = await fetch(buildUrl(path), {
    method: "PATCH",
    headers: {
      Accept: "application/json",
      ...getAuthHeaders(),
    },
    body,
  });

  if (!response.ok) {
    const message = await readErrorMessage(response);
    throw new Error(message || "Request failed");
  }

  return (await response.json()) as T;
};

export const apiDelete = async <T>(path: string, init?: RequestInit): Promise<T> => {
  const response = await fetch(buildUrl(path), {
    ...init,
    method: "DELETE",
    headers: {
      Accept: "application/json",
      ...getAuthHeaders(),
      ...(init?.headers ?? {}),
    },
  });

  if (!response.ok) {
    const message = await readErrorMessage(response);
    throw new Error(message || "Request failed");
  }

  return (await response.json()) as T;
};
