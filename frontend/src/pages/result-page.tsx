import { FileDown, TriangleAlert } from "lucide-react";
import { useMemo } from "react";
import { useParams } from "react-router-dom";

import { AppShell } from "@/components/layout/app-shell";
import { RiskBadge } from "@/components/shared/risk-badge";
import { VerdictBadge } from "@/components/shared/verdict-badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { dateLabel, durationLabel } from "@/lib/format";
import { getLocalAnalysisById } from "@/lib/storage";

export function ResultPage() {
  const params = useParams();
  const analysis = useMemo(() => getLocalAnalysisById(Number(params.id)), [params.id]);

  async function exportPdf() {
    if (!analysis) return;
    const { jsPDF } = await import("jspdf");
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text("Rapport d'analyse phishing", 14, 18);
    doc.setFontSize(11);
    doc.text(`URL: ${analysis.normalized_url}`, 14, 30);
    doc.text(`Score: ${analysis.score}/100`, 14, 38);
    doc.text(`Risque: ${analysis.risk_level}`, 14, 46);
    doc.text(`Verdict: ${analysis.verdict}`, 14, 54);
    doc.text("Indicateurs:", 14, 66);
    let y = 74;
    analysis.indicators.slice(0, 8).forEach((indicator) => {
      doc.text(`- ${indicator.label}: ${indicator.detected ? "oui" : "non"} (${indicator.weight})`, 16, y);
      y += 8;
    });
    doc.save(`analysis-${analysis.id}.pdf`);
  }

  if (!analysis) {
    return (
      <AppShell>
        <section className="container py-16">
          <Alert className="border-amber-200 bg-amber-50">
            <TriangleAlert className="mb-2 h-5 w-5 text-amber-600" />
            <AlertTitle>Résultat introuvable</AlertTitle>
            <AlertDescription>Relancez une analyse ou consultez l'historique local.</AlertDescription>
          </Alert>
        </section>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <section className="container py-16">
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-4xl">Résultat d'analyse</h1>
            <p className="mt-2 text-muted-foreground">{analysis.normalized_url}</p>
          </div>
          <Button variant="outline" onClick={exportPdf}>
            <FileDown className="mr-2 h-4 w-4" />
            Export PDF
          </Button>
        </div>
        {(analysis.error_message || (analysis.http_status ?? 0) >= 400) && (
          <Alert className="mb-6 border-amber-200 bg-amber-50">
            <AlertTitle>Analyse partielle</AlertTitle>
            <AlertDescription>
              {analysis.error_message ??
                `La ressource a répondu HTTP ${analysis.http_status}. Le moteur a limité l'analyse du contenu et le verdict doit être interprété avec prudence.`}
            </AlertDescription>
          </Alert>
        )}
        <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <Card>
            <CardHeader>
              <CardTitle>Vue synthétique</CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="rounded-3xl bg-slate-950 p-8 text-white">
                <p className="text-sm text-slate-300">Score de risque</p>
                <div className="mt-3 text-6xl font-bold">{analysis.score}</div>
                <p className="mt-2 text-sm text-slate-300">sur 100</p>
              </div>
              <div className="flex flex-wrap gap-3">
                <RiskBadge level={analysis.risk_level} />
                <VerdictBadge verdict={analysis.verdict} />
              </div>
              <div className="space-y-2 text-sm text-muted-foreground">
                <p>Date d'analyse: {dateLabel(analysis.analysis_finished_at)}</p>
                <p>Durée: {durationLabel(analysis.duration_ms)}</p>
                <p>Domaine: {analysis.domain}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Détails par indicateur</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Indicateur</TableHead>
                    <TableHead>Poids</TableHead>
                    <TableHead>Détecté</TableHead>
                    <TableHead>Détails</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {analysis.indicators.map((indicator) => (
                    <TableRow key={indicator.code}>
                      <TableCell className="font-medium">{indicator.label}</TableCell>
                      <TableCell>{indicator.weight}</TableCell>
                      <TableCell>{indicator.detected ? "Oui" : "Non"}</TableCell>
                      <TableCell className="text-muted-foreground">{indicator.details}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </section>
    </AppShell>
  );
}
