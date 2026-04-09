import { AppShell } from "@/components/layout/app-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export function TechnicalDocsPage() {
  return (
    <AppShell>
      <section className="container py-16">
        <div className="max-w-3xl space-y-4">
          <h1 className="text-4xl">Documentation technique</h1>
          <p className="text-muted-foreground">
            Vue synthétique de l'architecture, du scoring et des choix techniques pour la soutenance.
          </p>
        </div>
        <Tabs defaultValue="architecture" className="mt-8">
          <TabsList>
            <TabsTrigger value="architecture">Architecture</TabsTrigger>
            <TabsTrigger value="scoring">Scoring</TabsTrigger>
            <TabsTrigger value="security">Sécurité</TabsTrigger>
          </TabsList>
          <TabsContent value="architecture">
            <Card><CardHeader><CardTitle>Architecture</CardTitle></CardHeader><CardContent>Frontend Vite React TypeScript avec Tailwind et composants shadcn-style. Backend Django + Ninja pour l'API, SQLAlchemy pour la persistance métier et Alembic pour le schéma.</CardContent></Card>
          </TabsContent>
          <TabsContent value="scoring">
            <Card><CardHeader><CardTitle>Système de scoring</CardTitle></CardHeader><CardContent>Le score cumule des poids sur 100 à partir d'indicateurs de domaine, transport, contenu et comportement réseau. Chaque poids apparaît dans le rapport final.</CardContent></Card>
          </TabsContent>
          <TabsContent value="security">
            <Card><CardHeader><CardTitle>Mesures de sécurité</CardTitle></CardHeader><CardContent>Validation stricte des URLs, refus des cibles locales, timeout réseau, User-Agent explicite, logging et rate limiting simple par adresse IP.</CardContent></Card>
          </TabsContent>
        </Tabs>
      </section>
    </AppShell>
  );
}
