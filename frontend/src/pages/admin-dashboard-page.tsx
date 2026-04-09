import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Eye, ShieldEllipsis } from "lucide-react";

import { ScoresLineChart } from "@/components/charts/scores-line-chart";
import { RiskDistributionChart } from "@/components/charts/risk-distribution-chart";
import { AppShell } from "@/components/layout/app-shell";
import { RiskBadge } from "@/components/shared/risk-badge";
import { VerdictBadge } from "@/components/shared/verdict-badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useAuth } from "@/hooks/use-auth";
import { fetchAnalyses, fetchAnalysisById, fetchStats } from "@/lib/api";
import { dateLabel, durationLabel } from "@/lib/format";

export function AdminDashboardPage() {
  const { token } = useAuth();
  const [selectedAnalysisId, setSelectedAnalysisId] = useState<number | null>(null);
  const statsQuery = useQuery({
    queryKey: ["stats"],
    queryFn: () => fetchStats(token!),
    enabled: Boolean(token),
  });
  const analysesQuery = useQuery({
    queryKey: ["analyses", "dashboard"],
    queryFn: () => {
      const params = new URLSearchParams();
      params.set("limit", "200");
      return fetchAnalyses(params, token!);
    },
    enabled: Boolean(token),
  });
  const selectedAnalysisQuery = useQuery({
    queryKey: ["analysis-detail", selectedAnalysisId],
    queryFn: () => fetchAnalysisById(selectedAnalysisId!, token!),
    enabled: Boolean(token && selectedAnalysisId),
  });

  return (
    <AppShell>
      <section className="container py-10 sm:py-16">
        <div className="mb-8 flex items-center gap-4">
          <div className="grid h-14 w-14 place-items-center rounded-3xl bg-primary/10 text-primary">
            <ShieldEllipsis className="h-7 w-7" />
          </div>
          <div>
            <h1 className="text-4xl">Dashboard administrateur</h1>
            <p className="text-muted-foreground">Vue d'ensemble des analyses stockées dans la plateforme.</p>
          </div>
        </div>

        {statsQuery.isLoading ? (
          <div className="grid gap-6 md:grid-cols-3">
            <Skeleton className="h-36" />
            <Skeleton className="h-36" />
            <Skeleton className="h-36" />
          </div>
        ) : (
          <>
            <div className="grid gap-6 md:grid-cols-3">
              <Card>
                <CardHeader><CardDescription>Total</CardDescription><CardTitle>{statsQuery.data?.total_analyses ?? 0}</CardTitle></CardHeader>
              </Card>
              <Card>
                <CardHeader><CardDescription>Domaines suivis</CardDescription><CardTitle>{statsQuery.data?.top_domains.length ?? 0}</CardTitle></CardHeader>
              </Card>
              <Card>
                <CardHeader><CardDescription>Verdicts distincts</CardDescription><CardTitle>{statsQuery.data?.verdict_distribution.length ?? 0}</CardTitle></CardHeader>
              </Card>
            </div>

            <div className="mt-6 grid gap-6 lg:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Répartition du risque</CardTitle>
                </CardHeader>
                <CardContent>
                  <RiskDistributionChart data={statsQuery.data?.risk_distribution ?? []} />
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Évolution des scores</CardTitle>
                </CardHeader>
                <CardContent>
                  <ScoresLineChart data={statsQuery.data?.recent_scores ?? []} />
                </CardContent>
              </Card>
            </div>

            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Top domaines les plus analysés</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
                {statsQuery.data?.top_domains.map((domain) => (
                  <div key={domain.label} className="rounded-2xl border border-border bg-muted/40 p-4">
                    <p className="truncate font-medium">{domain.label}</p>
                    <p className="mt-1 text-sm text-muted-foreground">{domain.value} analyses</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          </>
        )}

        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Analyses récentes</CardTitle>
            <CardDescription>
              Toutes les analyses enregistrées sont listées ici. Cliquez sur une ligne pour ouvrir le détail complet.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {analysesQuery.isError && (
              <Alert className="mb-4 border-red-200 bg-red-50">
                <AlertTitle>Impossible de charger la liste des analyses</AlertTitle>
                <AlertDescription>{analysesQuery.error.message}</AlertDescription>
              </Alert>
            )}
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>URL</TableHead>
                  <TableHead>Domaine</TableHead>
                  <TableHead>Score</TableHead>
                  <TableHead>Risque</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {analysesQuery.data?.items.map((item) => (
                  <TableRow key={item.id} className="cursor-pointer" onClick={() => setSelectedAnalysisId(item.id)}>
                    <TableCell className="max-w-[340px] truncate">{item.normalized_url}</TableCell>
                    <TableCell>{item.domain}</TableCell>
                    <TableCell>{item.score}</TableCell>
                    <TableCell><RiskBadge level={item.risk_level} /></TableCell>
                    <TableCell>{dateLabel(item.analysis_finished_at)}</TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={(event) => {
                          event.stopPropagation();
                          setSelectedAnalysisId(item.id);
                        }}
                      >
                        <Eye className="h-4 w-4" />
                        Détails
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {analysesQuery.data && analysesQuery.data.items.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="py-10 text-center text-muted-foreground">
                      Aucune analyse enregistrée pour le moment.
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
              <DialogDescription>
                Résultat complet, verdict et indicateurs détaillés.
              </DialogDescription>
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
                    {selectedAnalysisQuery.data.http_status ? <p>HTTP : {selectedAnalysisQuery.data.http_status}</p> : null}
                    {selectedAnalysisQuery.data.error_message ? <p>{selectedAnalysisQuery.data.error_message}</p> : null}
                  </div>
                </div>

                <div>
                  <h3 className="mb-3 text-lg font-semibold">Indicateurs</h3>
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
              </div>
            ) : (
              <Alert className="border-red-200 bg-red-50">
                <AlertTitle>Détail indisponible</AlertTitle>
                <AlertDescription>
                  Impossible de récupérer les détails de cette analyse.
                </AlertDescription>
              </Alert>
            )}
          </DialogContent>
        </Dialog>
      </section>
    </AppShell>
  );
}
