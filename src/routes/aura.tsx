import { createFileRoute, Outlet } from "@tanstack/react-router";
import { PageShell, PageHero } from "@/components/PageShell";
import { AuraNav } from "@/components/AuraNav";

export const Route = createFileRoute("/aura")({
  head: () => ({
    meta: [
      { title: "Aura — Estética e Presença | Santuário do Glow-up" },
      { name: "description", content: "O arsenal estético do homem refinado: barba, cabelo, vestuário, perfume e presença." },
      { property: "og:title", content: "Aura — Estética e Presença" },
      { property: "og:description", content: "A forma como o mundo te lê antes de tu falares." },
    ],
  }),
  component: AuraLayout,
});

function AuraLayout() {
  return (
    <PageShell>
      <PageHero
        eyebrow="Pilar I · Aura"
        title="O arsenal estético"
        intro="Antes do verbo, há a presença. Cada detalhe é uma frase silenciosa — a barba, a coroa, a armadura, a assinatura invisível."
      />
      <AuraNav />
      <Outlet />
    </PageShell>
  );
}
