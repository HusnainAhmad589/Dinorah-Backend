const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5001/api";

export interface ApiFetchOptions extends RequestInit {
  data?: unknown;
}

/**
 * Core API fetcher with token injection, JSON parsing, and structured error throwing.
 */
export async function apiFetch<T>(endpoint: string, options: ApiFetchOptions = {}): Promise<T> {
  const { data, headers, ...customConfig } = options;

  const token = localStorage.getItem("dinorah_token");

  const defaultHeaders: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (token) {
    defaultHeaders["Authorization"] = `Bearer ${token}`;
  }

  const config: RequestInit = {
    ...customConfig,
    headers: {
      ...defaultHeaders,
      ...(headers as Record<string, string>),
    },
  };

  if (data !== undefined) {
    config.body = JSON.stringify(data);
  }

  const fullUrl = `${API_BASE_URL.replace(/\/$/, "")}/${endpoint.replace(/^\//, "")}`;

  try {
    const response = await fetch(fullUrl, config);
    const result = await response.json().catch(() => ({
      success: false,
      message: "Server returned a non-JSON response",
    }));

    if (!response.ok) {
      const errorMessage = result.message || `Request failed with status ${response.status}`;
      const error: Error & { status?: number; errors?: unknown } = new Error(errorMessage);
      error.status = response.status;
      error.errors = result.errors;
      throw error;
    }

    return result as T;
  } catch (error: unknown) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("An unknown network error occurred");
  }
}
