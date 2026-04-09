export type RiskLevel = "low" | "medium" | "high" | "critical";
export type Verdict = "probably_safe" | "suspect" | "phishing_probable";

export interface Indicator {
  code: string;
  label: string;
  category: string;
  weight: number;
  detected: boolean;
  details: string;
}

export interface Analysis {
  id: number;
  submitted_url: string;
  normalized_url: string;
  domain: string;
  scheme: string;
  score: number;
  risk_level: RiskLevel;
  verdict: Verdict;
  status: string;
  analysis_finished_at: string | null;
  duration_ms: number | null;
  error_message?: string | null;
  http_status?: number | null;
  redirected_to?: string | null;
  screenshot_path?: string | null;
  indicators: Indicator[];
  details_json: Record<string, unknown>;
}

export interface AnalysisSummary {
  id: number;
  submitted_url: string;
  normalized_url: string;
  domain: string;
  score: number;
  risk_level: RiskLevel;
  verdict: Verdict;
  status: string;
  analysis_finished_at: string | null;
  duration_ms: number | null;
}

export interface AnalysisListResponse {
  items: AnalysisSummary[];
  total: number;
}

export interface StatsResponse {
  total_analyses: number;
  risk_distribution: { label: string; value: number }[];
  verdict_distribution: { label: string; value: number }[];
  top_domains: { label: string; value: number }[];
  recent_scores: { label: string; score: number }[];
}

export interface LoginResponse {
  access_token: string;
  expires_in: number;
  token_type: string;
  user: {
    id: number;
    username: string;
    email: string;
    role: "admin" | "user";
    last_login_at: string | null;
  };
}
