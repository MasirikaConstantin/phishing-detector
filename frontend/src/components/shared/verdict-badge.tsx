import { Badge } from "@/components/ui/badge";
import type { Verdict } from "@/lib/types";
import { verdictLabel } from "@/lib/format";

const mapping = {
  probably_safe: "low",
  suspect: "medium",
  phishing_probable: "critical",
} as const;

export function VerdictBadge({ verdict }: { verdict: Verdict }) {
  return <Badge variant={mapping[verdict]}>{verdictLabel(verdict)}</Badge>;
}
