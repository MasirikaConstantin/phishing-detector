import type { Analysis, AnalysisListResponse, LoginResponse, StatsResponse } from "@/lib/types";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8000/api/v1";

async function request<T>(path: string, init?: RequestInit, token?: string): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(init?.headers ?? {}),
    },
  });

  if (!response.ok) {
    const payload = await response.json().catch(() => ({}));
    throw new Error(payload.detail ?? "Erreur serveur.");
  }

  return response.json() as Promise<T>;
}

export function analyzeUrl(url: string, token?: string) {
  return request<Analysis>("/analyze", {
    method: "POST",
    body: JSON.stringify({ url }),
  }, token);
}

export function login(username: string, password: string) {
  return request<LoginResponse>("/auth/login", {
    method: "POST",
    body: JSON.stringify({ username, password }),
  });
}

export function fetchStats(token: string) {
  return request<StatsResponse>("/stats", undefined, token);
}

export function fetchAnalyses(params: URLSearchParams, token: string) {
  const query = params.toString() ? `?${params.toString()}` : "";
  return request<AnalysisListResponse>(`/analyses${query}`, undefined, token);
}

export function fetchAnalysisById(id: number, token: string) {
  return request<Analysis>(`/analyses/${id}`, undefined, token);
}
