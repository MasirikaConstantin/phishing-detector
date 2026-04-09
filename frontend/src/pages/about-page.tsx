import { AppShell } from "@/components/layout/app-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function AboutPage() {
  return (
    <AppShell>
      <section className="container py-16">
        <div className="max-w-3xl space-y-4">
          <h1 className="text-4xl">À propos du projet</h1>
          <p className="text-lg text-muted-foreground">
            Ce projet illustre la conception d'une plateforme web académique de détection de phishing, centrée sur l'explicabilité des résultats et la démonstration d'une architecture full-stack propre.
          </p>
        </div>
        <div className="mt-8 grid gap-6 md:grid-cols-3">
          <Card><CardHeader><CardTitle>Objectif</CardTitle></CardHeader><CardContent>Évaluer automatiquement une URL suspecte et produire un verdict argumenté.</CardContent></Card>
          <Card><CardHeader><CardTitle>Angle cybersécurité</CardTitle></CardHeader><CardContent>Analyse heuristique, validation d'entrées, protection SSRF, journalisation et limitation des abus.</CardContent></Card>
          <Card><CardHeader><CardTitle>Valeur académique</CardTitle></CardHeader><CardContent>Interface crédible, API documentée, Dockerisation, tests et pistes d'amélioration ML.</CardContent></Card>
        </div>
      </section>
    </AppShell>
  );
}
