import type { Analysis, LoginResponse } from "@/lib/types";

const AUTH_KEY = "phishing-detector-auth";
const ANALYSES_KEY = "phishing-detector-local-analyses";

export function saveAuth(payload: LoginResponse) {
  localStorage.setItem(AUTH_KEY, JSON.stringify(payload));
}

export function getAuth(): LoginResponse | null {
  const raw = localStorage.getItem(AUTH_KEY);
  return raw ? (JSON.parse(raw) as LoginResponse) : null;
}

export function clearAuth() {
  localStorage.removeItem(AUTH_KEY);
}

export function storeLocalAnalysis(analysis: Analysis) {
  const current = getLocalAnalyses();
  const next = [analysis, ...current.filter((item) => item.id !== analysis.id)].slice(0, 15);
  localStorage.setItem(ANALYSES_KEY, JSON.stringify(next));
}

export function getLocalAnalyses(): Analysis[] {
  const raw = localStorage.getItem(ANALYSES_KEY);
  return raw ? (JSON.parse(raw) as Analysis[]) : [];
}

export function getLocalAnalysisById(id: number) {
  return getLocalAnalyses().find((item) => item.id === id) ?? null;
}
