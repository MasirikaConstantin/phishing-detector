import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

import { AppShell } from "@/components/layout/app-shell";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/hooks/use-auth";
import { analyzeUrl } from "@/lib/api";
import { storeLocalAnalysis } from "@/lib/storage";
import { UrlAnalyzerForm, type UrlAnalyzerFormValues } from "@/features/analysis/url-analyzer-form";

export function AnalyzePage() {
  const navigate = useNavigate();
  const { token } = useAuth();
  const mutation = useMutation({
    mutationFn: (values: UrlAnalyzerFormValues) => analyzeUrl(values.url, token),
    onSuccess: (analysis) => {
      storeLocalAnalysis(analysis);
      toast.success("Analyse terminée.");
      navigate(`/result/${analysis.id}`);
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  return (
    <AppShell>
      <section className="container py-10 sm:py-16">
        <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
          <Card>
            <CardHeader>
              <CardTitle>Analyser une URL</CardTitle>
              <CardDescription>
                Soumettez une URL suspecte pour obtenir un score de risque, un verdict et le détail des indicateurs.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <UrlAnalyzerForm onSubmit={(values) => mutation.mutate(values)} isPending={mutation.isPending} />
            </CardContent>
          </Card>
          <div className="space-y-6">
            <Alert className="border-blue-200 bg-blue-50">
              <AlertTitle>Bonnes pratiques d'analyse</AlertTitle>
              <AlertDescription>
                L'outil privilégie l'analyse statique et limite le scraping agressif. Les cibles locales et les réseaux privés sont refusés.
              </AlertDescription>
            </Alert>
            <Card>
              <CardHeader>
                <CardTitle>Méthode de scoring</CardTitle>
                <CardDescription>Heuristiques pondérées sur 100</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-muted-foreground">
                <p>URL anormale, domaine récent, formulaires sensibles, marque incohérente, redirections et ressources externes.</p>
                <p>Le score reste explicable: chaque poids est visible et chaque déclenchement est justifié.</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </AppShell>
  );
}
