import { useQuery } from "@tanstack/react-query";
import { ShieldEllipsis } from "lucide-react";

import { ScoresLineChart } from "@/components/charts/scores-line-chart";
import { RiskDistributionChart } from "@/components/charts/risk-distribution-chart";
import { AppShell } from "@/components/layout/app-shell";
import { RiskBadge } from "@/components/shared/risk-badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useAuth } from "@/hooks/use-auth";
import { fetchAnalyses, fetchStats } from "@/lib/api";
import { dateLabel } from "@/lib/format";

export function AdminDashboardPage() {
  const { token } = useAuth();
  const statsQuery = useQuery({
    queryKey: ["stats"],
    queryFn: () => fetchStats(token!),
    enabled: Boolean(token),
  });
  const analysesQuery = useQuery({
    queryKey: ["analyses", "dashboard"],
    queryFn: () => fetchAnalyses(new URLSearchParams(), token!),
    enabled: Boolean(token),
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
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>URL</TableHead>
                  <TableHead>Domaine</TableHead>
                  <TableHead>Score</TableHead>
                  <TableHead>Risque</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {analysesQuery.data?.items.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="max-w-[340px] truncate">{item.normalized_url}</TableCell>
                    <TableCell>{item.domain}</TableCell>
                    <TableCell>{item.score}</TableCell>
                    <TableCell><RiskBadge level={item.risk_level} /></TableCell>
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
