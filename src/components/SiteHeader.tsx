import { Link } from "@tanstack/react-router";
import { ColumnLogo } from "./Ornaments";

const nav = [
  { to: "/dashboard", label: "Dashboard" },
  { to: "/habitos", label: "Hábitos" },
  { to: "/aura", label: "Aura" },
  { to: "/biblioteca", label: "Biblioteca e Leituras" },
  { to: "/mentor", label: "Mentor" },
] as const;

export function SiteHeader() {
  const navClass = "text-foreground/70 transition-colors hover:text-foreground";
  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/85 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link to="/" className="flex items-center gap-3 text-aegean">
          <ColumnLogo className="h-8 w-7 text-gold" />
          <div className="leading-tight">
            <div className="font-display text-lg">Santuário</div>
            <div className="label-eyebrow !text-[0.6rem]">do glow-up</div>
          </div>
        </Link>
        <div className="flex items-center gap-6">
          <nav className="hidden items-center gap-7 text-sm md:flex">
            {nav.map((n) => (
              <Link
                key={n.to}
                to={n.to}
                className={navClass}
                activeProps={{ className: "text-foreground font-medium" }}
              >
                {n.label}
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </header>
  );
}
