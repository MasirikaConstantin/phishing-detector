import type { RiskLevel, Verdict } from "@/lib/types";

export function riskLabel(level: RiskLevel) {
  return {
    low: "Faible",
    medium: "Moyen",
    high: "Élevé",
    critical: "Critique",
  }[level];
}

export function verdictLabel(verdict: Verdict) {
  return {
    probably_safe: "Probablement sûr",
    suspect: "Suspect",
    phishing_probable: "Phishing probable",
  }[verdict];
}

export function durationLabel(durationMs: number | null) {
  if (!durationMs) return "n/a";
  return `${(durationMs / 1000).toFixed(2)} s`;
}

export function dateLabel(value: string | null) {
  if (!value) return "n/a";
  return new Intl.DateTimeFormat("fr-FR", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}
