import { createFileRoute } from "@tanstack/react-router";
import { AuraSection } from "@/components/AuraSection";
import { AuraGallery } from "@/components/AuraGallery";

export const Route = createFileRoute("/aura/acessorios")({
  head: () => ({
    meta: [
      { title: "Acessórios — O Toque de Ouro | Santuário do Glow-up" },
      { name: "description", content: "Curadoria de relógios, anéis e óculos. O metal que conclui sem excesso." },
    ],
  }),
  component: () => (
    <AuraSection
      pageKey="aura/acessorios"
      eyebrow="Aura · V"
      title="O Toque de Ouro"
      intro="O acessório é a pontuação da frase visual. Pouco e certo encerra; muito e errado dispersa. O ouro conclui — não grita."

      ritual={[
        "Polimento mensal das peças metálicas.",
        "Estojo individual para cada relógio.",
        "Couro tratado a cada 60 dias com hidratante específico.",
        "Regra do menos-é-mais: três acessórios visíveis no máximo.",
      ]}
      mission={{
        id: "acessorios-1",
        title: "Regra dos três visíveis",
        brief: "Sai hoje com no máximo três acessórios visíveis. Observa como te sentes — e como és olhado.",
        steps: [
          "Antes de sair, conta: relógio, anel, óculos, cinto, lenço, pulseira...",
          "Remove até restarem três peças coerentes em metal e couro.",
          "Ao final do dia, anota a diferença na tua presença.",
        ],
      }}
    >
      <AuraGallery storageKey="aura.acessorios.gallery" title="Inventário de Acessórios" />
    </AuraSection>
  ),
});
