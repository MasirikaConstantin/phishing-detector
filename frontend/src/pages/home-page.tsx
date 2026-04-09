import { Activity, ChartNoAxesCombined, ShieldCheck, TerminalSquare } from "lucide-react";
import { Link } from "react-router-dom";

import { AppShell } from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const features = [
  { title: "Analyse explicable", description: "Chaque score est justifié par des indicateurs lisibles et pondérés.", icon: ShieldCheck },
  { title: "Dashboard crédible", description: "Historique, top domaines, répartition des niveaux de risque et courbe des scores.", icon: ChartNoAxesCombined },
  { title: "Sécurité intégrée", description: "Validation stricte, SSRF bloqué, timeouts réseau, journalisation et limitation basique des abus.", icon: Activity },
  { title: "Architecture démontrable", description: "React moderne, Django, SQLAlchemy, Pydantic, Docker et documentation soutenance.", icon: TerminalSquare },
];

export function HomePage() {
  return (
    <AppShell>
      <section className="grid-surface border-b border-border/50">
        <div className="container grid gap-12 py-20 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
          <div className="space-y-8">
            <div className="inline-flex rounded-full border border-blue-200 bg-blue-50 px-4 py-2 text-sm text-blue-700">
              Plateforme de détection de sites frauduleux
            </div>
            <div className="space-y-5">
              <h1 className="max-w-3xl text-5xl leading-tight md:text-6xl">
                Détecter, expliquer et historiser les URLs de phishing dans une interface académique crédible.
              </h1>
              <p className="max-w-2xl text-lg text-muted-foreground">
                Le projet combine analyse heuristique, API REST sécurisée, tableau de bord administrateur et restitution claire du score de risque sur 100.
              </p>
            </div>
            <div className="flex flex-col gap-4 sm:flex-row">
              <Button asChild size="lg">
                <Link to="/analyse">Analyser une URL</Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link to="/demo">Voir la démo</Link>
              </Button>
            </div>
          </div>
          <Card className="overflow-hidden border-blue-100 bg-slate-950 text-slate-100">
            <CardHeader>
              <CardTitle className="text-slate-50">Synthèse de soutenance</CardTitle>
              <CardDescription className="text-slate-300">Vision produit et techniques utilisées</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 text-sm text-slate-200">
              <div className="rounded-2xl bg-white/5 p-4">
                <p className="mb-1 text-slate-400">Cible</p>
                <p>Étudiants, jurys académiques et démonstrations orientées cybersécurité web.</p>
              </div>
              <div className="rounded-2xl bg-white/5 p-4">
                <p className="mb-1 text-slate-400">Score</p>
                <p>Heuristique pondérée, explicable, extensible et prête pour intégration ML future.</p>
              </div>
              <div className="rounded-2xl bg-white/5 p-4">
                <p className="mb-1 text-slate-400">Ops</p>
                <p>Monorepo Dockerisé, MySQL persistant, API documentée et configuration reproductible.</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="container py-16">
        <div className="mb-8 max-w-2xl">
          <h2 className="text-3xl">Fonctionnalités principales</h2>
          <p className="mt-3 text-muted-foreground">
            Conçu pour une démonstration claire: soumission publique, rendu détaillé, historique administrateur et visualisations de dashboard.
          </p>
        </div>
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {features.map((feature) => (
            <Card key={feature.title} className="border-white/60 bg-white/80 backdrop-blur">
              <CardHeader>
                <feature.icon className="h-8 w-8 text-primary" />
                <CardTitle className="mt-2">{feature.title}</CardTitle>
                <CardDescription>{feature.description}</CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>
      </section>
    </AppShell>
  );
}
