import { createFileRoute } from "@tanstack/react-router";
import { AuraSection } from "@/components/AuraSection";
import { AuraCalendarAlert } from "@/components/AuraCalendarAlert";
import { ProductCatalog, type ProductCategory } from "@/components/ProductCatalog";

export const Route = createFileRoute("/aura/cabelo")({
  head: () => ({
    meta: [
      { title: "Cabelo — A Coroa | Santuário do Glow-up" },
      { name: "description", content: "Visagismo masculino: o corte ideal para cada estrutura óssea facial." },
    ],
  }),
  component: () => (
    <AuraSection
      pageKey="aura/cabelo"
      eyebrow="Aura · II"
      title="A Coroa"
      intro="O cabelo é arquitetura sobre o rosto. Não segue moda — segue o crânio. Visagismo é o que separa o corte do disfarce."

      ritual={[
        "Lavagem 2 a 3× por semana — não diariamente.",
        "Condicionador apenas nos comprimentos.",
        "Pomada à base de água para fixação sem brilho plástico.",
        "Corte regular a cada 4 semanas.",
      ]}
      mission={{
        id: "cabelo-1",
        title: "Briefing ao barbeiro",
        brief: "Vai ao próximo corte com referências escritas — não vagas. Define comprimento em cm, técnica e acabamento.",
        steps: [
          "Reúne 3 fotografias de cortes em homens com a tua estrutura facial.",
          "Anota: comprimento topo, laterais, técnica (tesoura/máquina), tipo de fade.",
          "Apresenta ao barbeiro antes de sentar na cadeira.",
        ],
      }}
    >
      <AuraCalendarAlert storageKey="aura.cabelo.alert" title="Manutenção do Corte" defaultFrequency={30} />
      <ProductCatalog
        storageKey="aura.cabelo.catalog"
        categories={["Cuidado Capilar"] as ProductCategory[]}
        defaultProducts={[
          { name: "Shampoo Anticaspa (Uso Semanal)", category: "Cuidado Capilar", investment: "Acessível", investmentValue: "R$ 20 - R$ 40", season: "Semanal · Tratamento", ritual: "Use 1-2× por semana. Deixe agir por 2 minutos antes de enxaguar. Não use diariamente para não ressecar o couro cabeludo.", rating: 4 },
          { name: "Condicionador (Comprimentos)", category: "Cuidado Capilar", investment: "Acessível", investmentValue: "R$ 15 - R$ 35", season: "A cada lavagem", ritual: "Aplique apenas nos fios, nunca na raiz. Aguarde 2-3 minutos e enxágue completamente com água fria para selar as cutículas.", rating: 4 },
          { name: "Pomada Fixadora (Base de Água)", category: "Cuidado Capilar", investment: "Moderado", investmentValue: "R$ 40 - R$ 80", season: "Diário · Modelação", ritual: "Aqueça uma pequena quantidade entre as palmas e aplique nos fios secos ou ligeiramente úmidos. Modela sem criar brilho plástico.", rating: 5 },
          { name: "Óleo Finalizador (Argan/Jojoba)", category: "Cuidado Capilar", investment: "Moderado", investmentValue: "R$ 50 - R$ 100", season: "Pós-lavagem · Tratamento", ritual: "2-3 gotas nas pontas ainda úmidas. Reduz o frizz e adiciona brilho natural sem pesar o cabelo.", rating: 4 },
        ]}
      />
    </AuraSection>
  ),
});

