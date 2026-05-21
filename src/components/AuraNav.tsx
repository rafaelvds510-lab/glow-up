import { Link } from "@tanstack/react-router";

const tabs: { to: string; label: string; exact?: boolean }[] = [
  { to: "/aura", label: "Visão Geral", exact: true },
  { to: "/aura/barba", label: "Barba & Rosto" },
  { to: "/aura/cabelo", label: "Cabelo" },
  { to: "/aura/vestuario", label: "Vestuário" },
  { to: "/aura/perfume", label: "Perfume" },
  { to: "/aura/acessorios", label: "Acessórios" },
  { to: "/aura/skincare", label: "Skincare" },
];

export function AuraNav() {
  return (
    <nav className="sticky top-[65px] z-30 border-b border-border/60 bg-background/90 backdrop-blur">
      <div className="mx-auto max-w-6xl px-6">
        <ul className="flex gap-2 overflow-x-auto py-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {tabs.map((t) => (
            <li key={t.to} className="shrink-0">
              <Link
                to={t.to}
                activeOptions={{ exact: t.exact ?? false }}
                className="label-eyebrow inline-block rounded-full border border-gold/40 bg-marble/40 px-4 py-2 !text-[0.65rem] text-aegean transition-all duration-300 hover:border-gold hover:bg-gold/10 hover:text-aegean hover:shadow-[0_0_18px_-4px_color-mix(in_oklab,var(--gold)_55%,transparent)]"
                activeProps={{
                  className:
                    "label-eyebrow inline-block rounded-full border border-gold bg-gold/15 px-4 py-2 !text-[0.65rem] !text-aegean shadow-[0_0_14px_-2px_color-mix(in_oklab,var(--gold)_60%,transparent)]",
                }}
              >
                {t.label}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
}
