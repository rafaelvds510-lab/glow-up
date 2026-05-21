import { createFileRoute } from "@tanstack/react-router";
import { AuraSection } from "@/components/AuraSection";
import { AuraGallery } from "@/components/AuraGallery";

export const Route = createFileRoute("/aura/vestuario")({
  head: () => ({
    meta: [
      { title: "Vestuário — A Armadura | Santuário do Glow-up" },
      { name: "description", content: "Caimento, psicologia das cores e o armário cápsula de autoridade." },
    ],
  }),
  component: () => (
    <AuraSection
      pageKey="aura/vestuario"
      eyebrow="Aura · III"
      title="A Armadura"
      intro="A roupa é o argumento que falas antes de abrir a boca. Caimento é gramática; cor, retórica; o armário cápsula, a tua tese."

      ritual={[
        "Inspeção semanal: o que não vestes em 90 dias, sai.",
        "Engoma camisas em casa — domingo à noite.",
        "Sapato impecável: graxa quinzenal, formas sempre.",
        "Investe em alfaiataria para ajustes — não há substituto.",
      ]}
      mission={{
        id: "vestuario-1",
        title: "Auditoria do armário",
        brief: "Esvazia uma gaveta ou prateleira. Cada peça que não vestes há 90 dias — doa, vende ou descarta.",
        steps: [
          "Separa três pilhas: ficar, ajustar, sair.",
          "Marca com alfaiate as peças da pilha 'ajustar' esta semana.",
          "Lista as 5 peças que faltam para fechar o teu cápsula.",
        ],
      }}
    >
      <AuraGallery storageKey="aura.vestuario.gallery" title="Guarda-Roupa Virtual" />
    </AuraSection>
  ),
});
