import { Link, NavLink } from "react-router-dom";
import { Menu } from "lucide-react";

import { Logo } from "@/components/shared/logo";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useAuth } from "@/hooks/use-auth";

const links = [
  { to: "/", label: "Accueil" },
  { to: "/analyse", label: "Analyse" },
  { to: "/history", label: "Historique" },
  { to: "/demo", label: "Démo" },
  { to: "/about", label: "À propos" },
  { to: "/technical-docs", label: "Documentation" },
];

export function SiteHeader() {
  const { auth, logout, isAdmin } = useAuth();

  return (
    <header className="sticky top-0 z-30 border-b border-border/60 bg-background/80 backdrop-blur-lg">
      <div className="container flex h-20 items-center justify-between gap-4">
        <Link to="/">
          <Logo />
        </Link>
        <nav className="hidden items-center gap-6 lg:flex">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                `text-sm ${isActive ? "font-semibold text-foreground" : "text-muted-foreground"}`
              }
            >
              {link.label}
            </NavLink>
          ))}
          {isAdmin && <NavLink to="/admin" className="text-sm text-muted-foreground">Dashboard</NavLink>}
        </nav>
        <div className="hidden items-center gap-3 lg:flex">
          {auth ? (
            <>
              <span className="text-sm text-muted-foreground">{auth.user.username}</span>
              <Button variant="outline" onClick={logout}>Déconnexion</Button>
            </>
          ) : (
            <Button asChild variant="outline">
              <Link to="/login">Connexion admin</Link>
            </Button>
          )}
        </div>
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon" className="lg:hidden">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent>
            <div className="mt-8 space-y-4">
              {links.map((link) => (
                <NavLink key={link.to} to={link.to} className="block text-base">
                  {link.label}
                </NavLink>
              ))}
              {isAdmin && <NavLink to="/admin" className="block text-base">Dashboard</NavLink>}
              {auth ? (
                <Button variant="outline" onClick={logout} className="w-full">Déconnexion</Button>
              ) : (
                <Button asChild className="w-full">
                  <Link to="/login">Connexion admin</Link>
                </Button>
              )}
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}
