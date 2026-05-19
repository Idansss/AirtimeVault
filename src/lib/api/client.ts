import type { ApiResponse } from "@/types";

export class FetchError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

async function apiFetch<T = unknown>(url: string, options?: RequestInit): Promise<T> {
  const res  = await fetch(url, {
    headers: { "Content-Type": "application/json", ...options?.headers },
    ...options,
  });
  const json: ApiResponse<T> = await res.json();
  if (!json.success || !res.ok) {
    throw new FetchError(res.status, json.error ?? "An error occurred");
  }
  return json.data as T;
}

export const api = {
  get:    <T>(url: string)                  => apiFetch<T>(url),
  post:   <T>(url: string, body: unknown)   => apiFetch<T>(url, { method: "POST",   body: JSON.stringify(body) }),
  patch:  <T>(url: string, body: unknown)   => apiFetch<T>(url, { method: "PATCH",  body: JSON.stringify(body) }),
  put:    <T>(url: string, body: unknown)   => apiFetch<T>(url, { method: "PUT",    body: JSON.stringify(body) }),
  delete: <T>(url: string)                  => apiFetch<T>(url, { method: "DELETE" }),
};
