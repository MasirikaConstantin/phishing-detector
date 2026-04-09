import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Eye } from "lucide-react";

import { AppShell } from "@/components/layout/app-shell";
import { RiskBadge } from "@/components/shared/risk-badge";
import { VerdictBadge } from "@/components/shared/verdict-badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useAuth } from "@/hooks/use-auth";
import { fetchAnalyses, fetchAnalysisById } from "@/lib/api";
import { dateLabel, durationLabel } from "@/lib/format";
import { getLocalAnalyses } from "@/lib/storage";

export function HistoryPage() {
  const { token, isAdmin } = useAuth();
  const [risk, setRisk] = useState("all");
  const [verdict, setVerdict] = useState("all");
  const [minScore, setMinScore] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [selectedAnalysisId, setSelectedAnalysisId] = useState<number | null>(null);

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
  const selectedAnalysisQuery = useQuery({
    queryKey: ["history-analysis-detail", selectedAnalysisId],
    queryFn: () => fetchAnalysisById(selectedAnalysisId!, token!),
    enabled: Boolean(token && isAdmin && selectedAnalysisId),
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
            {isAdmin && adminQuery.isError && (
              <Alert className="mb-4 border-red-200 bg-red-50">
                <AlertTitle>Erreur de chargement</AlertTitle>
                <AlertDescription>{adminQuery.error.message}</AlertDescription>
              </Alert>
            )}
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>URL</TableHead>
                  <TableHead>Score</TableHead>
                  <TableHead>Risque</TableHead>
                  <TableHead>Verdict</TableHead>
                  <TableHead>Date</TableHead>
                  {isAdmin && <TableHead className="text-right">Action</TableHead>}
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
                    {isAdmin && (
                      <TableCell className="text-right">
                        <Button variant="outline" size="sm" onClick={() => setSelectedAnalysisId(item.id)}>
                          <Eye className="h-4 w-4" />
                          Détails
                        </Button>
                      </TableCell>
                    )}
                  </TableRow>
                ))}
                {items.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={isAdmin ? 6 : 5} className="py-10 text-center text-muted-foreground">
                      Aucune analyse disponible avec ces filtres.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Dialog open={selectedAnalysisId !== null} onOpenChange={(open) => !open && setSelectedAnalysisId(null)}>
          <DialogContent className="max-h-[85vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Détail de l'analyse</DialogTitle>
              <DialogDescription>Historique complet avec indicateurs détaillés.</DialogDescription>
            </DialogHeader>
            {selectedAnalysisQuery.isLoading ? (
              <div className="space-y-3">
                <Skeleton className="h-20" />
                <Skeleton className="h-48" />
              </div>
            ) : selectedAnalysisQuery.data ? (
              <div className="space-y-6">
                <div className="rounded-2xl bg-muted/40 p-4">
                  <p className="break-all font-medium">{selectedAnalysisQuery.data.normalized_url}</p>
                  <div className="mt-3 flex flex-wrap gap-3">
                    <RiskBadge level={selectedAnalysisQuery.data.risk_level} />
                    <VerdictBadge verdict={selectedAnalysisQuery.data.verdict} />
                  </div>
                  <div className="mt-3 space-y-1 text-sm text-muted-foreground">
                    <p>Score : {selectedAnalysisQuery.data.score}/100</p>
                    <p>Domaine : {selectedAnalysisQuery.data.domain}</p>
                    <p>Date : {dateLabel(selectedAnalysisQuery.data.analysis_finished_at)}</p>
                    <p>Durée : {durationLabel(selectedAnalysisQuery.data.duration_ms)}</p>
                  </div>
                </div>
                <div className="space-y-3">
                  {selectedAnalysisQuery.data.indicators.map((indicator) => (
                    <div key={indicator.code} className="rounded-2xl border border-border p-4">
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <p className="font-medium">{indicator.label}</p>
                        <div className="flex items-center gap-3 text-sm">
                          <span>Poids {indicator.weight}</span>
                          <span className={indicator.detected ? "text-red-600" : "text-emerald-600"}>
                            {indicator.detected ? "Détecté" : "Non détecté"}
                          </span>
                        </div>
                      </div>
                      <p className="mt-2 text-sm text-muted-foreground">{indicator.details}</p>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <Alert className="border-red-200 bg-red-50">
                <AlertTitle>Détail indisponible</AlertTitle>
                <AlertDescription>Impossible de récupérer les détails de cette analyse.</AlertDescription>
              </Alert>
            )}
          </DialogContent>
        </Dialog>
      </section>
    </AppShell>
  );
}
