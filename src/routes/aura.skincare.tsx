import { createFileRoute } from "@tanstack/react-router";
import { AuraSection } from "@/components/AuraSection";
import { AuraCalendarAlert } from "@/components/AuraCalendarAlert";
import { ProductCatalog, type ProductCategory } from "@/components/ProductCatalog";

export const Route = createFileRoute("/aura/skincare")({
  head: () => ({
    meta: [
      { title: "Skincare — Pele & Higiene | Santuário do Glow-up" },
      { name: "description", content: "Protocolo de cuidado da pele masculina — limpeza, tratamento e hidratação." },
    ],
  }),
  component: () => (
    <AuraSection
      pageKey="aura/skincare"
      eyebrow="Aura · VI"
      title="Pele & Higiene"
      intro="A pele é mármore vivo — esculpida diariamente pelo sol, pelo sono e pelo gesto. Cuidá-la é arquitetura preventiva."

      ritual={[
        "Manhã: lavar o rosto, tônico, hidratante, FPS 50.",
        "Noite: lavar o rosto, gel antiacne, hidratante.",
        "Semanal: esfoliação + óleo de jojoba nas sobrancelhas.",
        "Minoxidil nas sobrancelhas para preenchimento — 1× ao dia.",
        "Dormir de barriga para cima para preservar simetria facial.",
      ]}
      mission={{
        id: "skincare-1",
        title: "Sete dias de protocolo",
        brief: "Aplica o ritual matinal e noturno por sete dias consecutivos. Fotografa o rosto no dia 1 e no dia 7 em luz natural.",
        steps: [
          "Manhã: Granado (limpeza) → Tônico de Laranja → Gel Antiacne → Nivea → FPS 50.",
          "Noite: Granado → Gel Antiacne → Nivea.",
          "No 7º dia, fotografa a pele em luz natural e compara com o dia 1.",
        ],
      }}
    >
      <AuraCalendarAlert storageKey="aura.skincare.alert" title="Esfoliação e Limpeza Profunda" defaultFrequency={7} />
      <ProductCatalog
        storageKey="aura.skincare.catalog"
        categories={["Armadura da Pele"] as ProductCategory[]}
        defaultProducts={[
          { name: "Sabonete Granado Limpeza de Rosto", category: "Armadura da Pele", investment: "Acessível", investmentValue: "R$ 20 - R$ 30", season: "Diário · Manhã e Noite", ritual: "Espume entre as palmas úmidas e massageie com movimentos circulares por 60 segundos. Enxágue com água fria.", rating: 4 },
          { name: "Gel Antiacne Cimed", category: "Armadura da Pele", investment: "Acessível", investmentValue: "R$ 30 - R$ 50", season: "Diário · Tratamento Pós-Limpeza", ritual: "Aplique uma camada fina sobre a pele limpa e seca. Evite área dos olhos. Deixe absorver antes do hidratante.", rating: 4 },
          { name: "Tônico de Laranja Poderoso", category: "Armadura da Pele", investment: "Acessível", investmentValue: "R$ 35 - R$ 60", season: "Diário · Pós-Limpeza", ritual: "Aplique com algodão ou palmas das mãos após a limpeza. Sela o pH e prepara a pele para os próximos passos.", rating: 4 },
          { name: "Hidratante Corporal Nivea", category: "Armadura da Pele", investment: "Acessível", investmentValue: "R$ 25 - R$ 45", season: "Diário · Pós-banho", ritual: "Aplique no rosto e corpo ainda ligeiramente úmido para selar a hidratação. Movimentos ascendentes no rosto.", rating: 5 },
          { name: "Protetor Solar FPS 50", category: "Armadura da Pele", investment: "Moderado", investmentValue: "R$ 60 - R$ 100", season: "Manhã · Obrigatório Todo Dia", ritual: "Último passo da manhã. Aplique uniformemente 20 minutos antes de sair. Reaplique a cada 4h se exposição prolongada.", rating: 5 },
          { name: "Vaselina (sobrancelhas)", category: "Armadura da Pele", investment: "Acessível", investmentValue: "R$ 10 - R$ 20", season: "Noturno · Modelação", ritual: "Aplique uma quantidade mínima nas sobrancelhas à noite com o dedo. Sela a umidade e molda enquanto dorme.", rating: 4 },
        ]}
      />
    </AuraSection>
  ),
});


