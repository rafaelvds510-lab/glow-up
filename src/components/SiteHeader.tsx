import { Link, useRouterState } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { ColumnLogo } from "./Ornaments";

const nav = [
  { to: "/dashboard", label: "Dashboard" },
  { to: "/habitos", label: "Hábitos" },
  { to: "/aura", label: "Aura" },
  { to: "/biblioteca", label: "Biblioteca" },
] as const;

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const router = useRouterState();

  // Fecha menu ao navegar
  useEffect(() => { setOpen(false); }, [router.location.pathname]);

  // Fecha menu se a janela for redimensionada para desktop (md: 768px)
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) setOpen(false);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Bloqueia scroll do body quando menu aberto de forma segura
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  const linkClass = "text-foreground/70 transition-colors hover:text-foreground";
  const activeCls = "text-foreground font-medium";

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-border/60 bg-background/85 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 md:px-6">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 text-aegean flex-shrink-0" onClick={() => setOpen(false)}>
            <ColumnLogo className="h-8 w-7 text-gold" />
            <div className="leading-tight">
              <div className="font-display text-lg">Santuário</div>
              <div className="label-eyebrow !text-[0.6rem]">do glow-up</div>
            </div>
          </Link>

          {/* Nav desktop */}
          <nav className="hidden items-center gap-7 text-sm md:flex">
            {nav.map((n) => (
              <Link
                key={n.to}
                to={n.to}
                className={linkClass}
                activeProps={{ className: activeCls }}
              >
                {n.label}
              </Link>
            ))}
          </nav>

          {/* Botão hambúrguer mobile */}
          <button
            id="mobile-menu-toggle"
            aria-label="Abrir menu"
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
            className="flex h-[44px] w-[44px] flex-col items-end justify-center gap-[6px] md:hidden flex-shrink-0 z-50 ml-auto pl-4"
          >
            <span
              className="block h-[2px] w-6 bg-foreground transition-all duration-300"
              style={open ? { transform: "translateY(7px) rotate(45deg)" } : {}}
            />
            <span
              className="block h-[2px] w-6 bg-foreground transition-all duration-300"
              style={open ? { opacity: 0 } : {}}
            />
            <span
              className="block h-[2px] w-6 bg-foreground transition-all duration-300"
              style={open ? { transform: "translateY(-7px) rotate(-45deg)" } : {}}
            />
          </button>
        </div>
      </header>

      {/* Drawer mobile */}
      {open && (
        <div
          id="mobile-menu-overlay"
          className="fixed inset-0 z-30 bg-black/50 md:hidden"
          onClick={() => setOpen(false)}
          aria-hidden="true"
        />
      )}
      <nav
        id="mobile-menu"
        aria-label="Navegação mobile"
        className={`fixed top-0 right-0 z-40 h-full w-72 max-w-[85vw] bg-card border-l border-border flex flex-col pt-20 pb-8 px-6 gap-2 transition-transform duration-300 md:hidden ${open ? "translate-x-0" : "translate-x-full"}`}
      >
        <p className="label-eyebrow mb-4">Navegação</p>
        {nav.map((n) => (
          <Link
            key={n.to}
            to={n.to}
            onClick={() => setOpen(false)}
            className="font-display text-2xl text-foreground/70 py-3 border-b border-border/40 hover:text-primary transition-colors"
            activeProps={{ className: "font-display text-2xl text-primary py-3 border-b border-border/40" }}
          >
            {n.label}
          </Link>
        ))}
      </nav>
    </>
  );
}
