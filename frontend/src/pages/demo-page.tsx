import { BookOpenCheck } from "lucide-react";

import { AppShell } from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

export function DemoPage() {
  return (
    <AppShell>
      <section className="container py-16">
        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Scénario de démonstration</CardTitle>
              <CardDescription>Trame conseillée pour une soutenance fluide.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-muted-foreground">
              <p>1. Présenter l'objectif et la menace phishing.</p>
              <p>2. Soumettre une URL ambiguë depuis l'interface publique.</p>
              <p>3. Commenter les indicateurs déclenchés et le score.</p>
              <p>4. Montrer le dashboard admin, l'historique et les statistiques.</p>
            </CardContent>
          </Card>
          <Card className="bg-slate-950 text-slate-50">
            <CardHeader>
              <CardTitle className="text-slate-50">Démo rapide</CardTitle>
              <CardDescription className="text-slate-300">Accès guidé aux éléments forts du projet.</CardDescription>
            </CardHeader>
            <CardContent>
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="secondary">
                    <BookOpenCheck className="mr-2 h-4 w-4" />
                    Ouvrir la checklist démo
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Checklist de démonstration</DialogTitle>
                    <DialogDescription>Points à couvrir devant un jury académique.</DialogDescription>
                  </DialogHeader>
                  <div className="space-y-3 text-sm text-muted-foreground">
                    <p>Montrer la validation d'URL et le refus des cibles internes.</p>
                    <p>Expliquer le calcul du score sur 100.</p>
                    <p>Afficher les graphiques et l'historique administrateur.</p>
                    <p>Conclure sur les limites heuristiques et l'ouverture vers le machine learning.</p>
                  </div>
                </DialogContent>
              </Dialog>
            </CardContent>
          </Card>
        </div>
      </section>
    </AppShell>
  );
}
