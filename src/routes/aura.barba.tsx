import { createFileRoute } from "@tanstack/react-router";
import { AuraSection } from "@/components/AuraSection";
import { AuraCalendarAlert } from "@/components/AuraCalendarAlert";

export const Route = createFileRoute("/aura/barba")({
  head: () => ({
    meta: [
      { title: "Barba & Rosto — Aura | Santuário do Glow-up" },
      { name: "description", content: "Alinhamento dos fios, geometria facial e cuidado com a pele sob a barba." },
    ],
  }),
  component: () => (
    <AuraSection
      pageKey="aura/barba"
      eyebrow="Aura · I"
      title="Barba & Rosto"
      intro="A barba é moldura — não disfarce. Define o queixo, equilibra a testa, e revela disciplina nos detalhes."

      ritual={[
        "Lavagem com sabonete específico de barba 3× por semana.",
        "Óleo de barba ao secar — 3 gotas, distribuição com pente.",
        "Aparador de precisão a cada 5 dias para o contorno.",
        "Visita ao barbeiro a cada 3 semanas — sem exceções.",
      ]}
      mission={{
        id: "barba-1",
        title: "O espelho do cônsul",
        brief: "Estuda o teu próprio rosto durante 5 minutos sem julgamento. Identifica a forma (oval, quadrado, redondo, longo) e decide a barba que a serve.",
        steps: [
          "Fotografa-te de frente, com luz natural, expressão neutra.",
          "Traça mentalmente a linha mandibular e o contorno do pescoço.",
          "Marca a próxima visita ao barbeiro com a tua decisão por escrito.",
        ],
      }}
    >
      <AuraCalendarAlert storageKey="aura.barba.alert" title="Manutenção da Barba/Rosto" defaultFrequency={14} />
    </AuraSection>
  ),
});
