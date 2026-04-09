import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";

import { AppShell } from "@/components/layout/app-shell";
import { RiskBadge } from "@/components/shared/risk-badge";
import { VerdictBadge } from "@/components/shared/verdict-badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useAuth } from "@/hooks/use-auth";
import { fetchAnalyses } from "@/lib/api";
import { dateLabel } from "@/lib/format";
import { getLocalAnalyses } from "@/lib/storage";

export function HistoryPage() {
  const { token, isAdmin } = useAuth();
  const [risk, setRisk] = useState("all");
  const [verdict, setVerdict] = useState("all");
  const [minScore, setMinScore] = useState("");
  const [fromDate, setFromDate] = useState("");

  const adminQuery = useQuery({
    queryKey: ["analyses", risk, verdict, minScore, fromDate],
    queryFn: () => {
      const params = new URLSearchParams();
      if (risk !== "all") params.set("risk_level", risk);
      if (verdict !== "all") params.set("verdict", verdict);
      if (minScore) params.set("min_score", minScore);
      if (fromDate) params.set("from_date", `${fromDate}T00:00:00`);
      return fetchAnalyses(params, token!);
    },
    enabled: Boolean(token && isAdmin),
  });

  const localItems = useMemo(() => {
    const items = getLocalAnalyses();
    return items.filter((item) => {
      const riskOk = risk === "all" || item.risk_level === risk;
      const verdictOk = verdict === "all" || item.verdict === verdict;
      const scoreOk = !minScore || item.score >= Number(minScore);
      const dateOk = !fromDate || (item.analysis_finished_at ? new Date(item.analysis_finished_at) >= new Date(fromDate) : false);
      return riskOk && verdictOk && scoreOk && dateOk;
    });
  }, [risk, verdict, minScore, fromDate]);

  const items = isAdmin ? adminQuery.data?.items ?? [] : localItems;

  return (
    <AppShell>
      <section className="container py-10 sm:py-16">
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-4xl">Historique</h1>
            <p className="text-muted-foreground">
              {isAdmin ? "Historique global filtrable pour l'administration." : "Historique local des analyses réalisées depuis ce navigateur."}
            </p>
          </div>
        </div>
        <div className="mb-6 grid gap-4 md:grid-cols-4">
          <div>
            <Select value={risk} onValueChange={setRisk}>
              <SelectTrigger />
              <SelectContent>
                <SelectItem value="all">Tous les niveaux</SelectItem>
                <SelectItem value="low">Faible</SelectItem>
                <SelectItem value="medium">Moyen</SelectItem>
                <SelectItem value="high">Élevé</SelectItem>
                <SelectItem value="critical">Critique</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Select value={verdict} onValueChange={setVerdict}>
              <SelectTrigger />
              <SelectContent>
                <SelectItem value="all">Tous les verdicts</SelectItem>
                <SelectItem value="probably_safe">Probablement sûr</SelectItem>
                <SelectItem value="suspect">Suspect</SelectItem>
                <SelectItem value="phishing_probable">Phishing probable</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Input
            type="number"
            min={0}
            max={100}
            placeholder="Score minimum"
            value={minScore}
            onChange={(event) => setMinScore(event.target.value)}
          />
          <Input type="date" value={fromDate} onChange={(event) => setFromDate(event.target.value)} />
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Analyses enregistrées</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>URL</TableHead>
                  <TableHead>Score</TableHead>
                  <TableHead>Risque</TableHead>
                  <TableHead>Verdict</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="max-w-[400px] truncate">{item.normalized_url}</TableCell>
                    <TableCell>{item.score}</TableCell>
                    <TableCell><RiskBadge level={item.risk_level} /></TableCell>
                    <TableCell><VerdictBadge verdict={item.verdict} /></TableCell>
                    <TableCell>{dateLabel(item.analysis_finished_at)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </section>
    </AppShell>
  );
}
