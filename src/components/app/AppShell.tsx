import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { LayoutGrid, Target, Gauge, FileText, Leaf } from "lucide-react";

const NAV = [
  { to: "/", label: "Dashboard", icon: LayoutGrid },
  { to: "/metas", label: "Metas", icon: Target },
  { to: "/kpis", label: "KPIs & OKRs", icon: Gauge },
  { to: "/relatorio", label: "Relatório final", icon: FileText },
] as const;

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-20 border-b bg-background/85 backdrop-blur">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-4 px-6 py-4">
          <Link to="/" className="flex items-center gap-2">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-primary text-primary-foreground"><Leaf className="h-5 w-5" /></span>
            <span className="leading-tight">
              <span className="block font-display text-lg font-semibold">Metas Q4/2026</span>
              <span className="block text-xs text-muted-foreground">IA Agêntica · Gestor: Marcu</span>
            </span>
          </Link>
          <nav className="ml-auto flex flex-wrap gap-1">
            {NAV.map(({ to, label, icon: Icon }) => (
              <Link key={to} to={to} activeOptions={{ exact: to === "/" }}
                className="flex items-center gap-2 rounded-full px-4 py-2 text-sm text-muted-foreground transition-colors hover:bg-secondary hover:text-secondary-foreground"
                activeProps={{ className: "bg-secondary text-secondary-foreground font-medium" }}>
                <Icon className="h-4 w-4" />{label}
              </Link>
            ))}
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-6 py-8">{children}</main>
    </div>
  );
}
