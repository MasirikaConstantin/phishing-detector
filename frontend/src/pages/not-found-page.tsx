import { Link } from "react-router-dom";

import { AppShell } from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";

export function NotFoundPage() {
  return (
    <AppShell>
      <section className="container py-24 text-center">
        <p className="text-sm uppercase tracking-[0.4em] text-muted-foreground">404</p>
        <h1 className="mt-4 text-5xl">Page introuvable</h1>
        <p className="mt-4 text-muted-foreground">La ressource demandée n'existe pas ou a été déplacée.</p>
        <Button asChild className="mt-8">
          <Link to="/">Retour à l'accueil</Link>
        </Button>
      </section>
    </AppShell>
  );
}
