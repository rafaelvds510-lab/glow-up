import { createFileRoute } from "@tanstack/react-router";
import { AuraSection } from "@/components/AuraSection";
import { AuraCalendarAlert } from "@/components/AuraCalendarAlert";
import { ProductCatalog, type ProductCategory } from "@/components/ProductCatalog";

export const Route = createFileRoute("/aura/corpo")({
  head: () => ({
    meta: [
      { title: "Corpo — Físico & Postura | Santuário do Glow-up" },
      { name: "description", content: "Treinamento, postura e cuidados com o corpo. A estrutura que carrega a tua presença." },
    ],
  }),
  component: () => (
    <AuraSection
      pageKey="aura/corpo"
      eyebrow="Aura · VII"
      title="Corpo & Postura"
      intro="O corpo é o primeiro argumento — antes da voz, antes das palavras. Erguê-lo com disciplina é a oração que nunca mente."

      ritual={[
        "Treino de força 3 a 5× por semana — consistência supera intensidade.",
        "10 minutos de mobilidade ou alongamento antes de dormir.",
        "Correção postural: ombros para trás, queixo paralelo ao chão, ao sentar e ao caminhar.",
        "Hidratação de 2L de água por dia — a pele e a musculatura agradecem.",
        "Aplicar hidratante corporal após o banho enquanto a pele ainda está úmida.",
        "Esfoliar o corpo 1× por semana para remover células mortas e uniformizar o tom.",
      ]}
      mission={{
        id: "corpo-1",
        title: "A escultura dos cem dias",
        brief: "Comprometa-se com 100 dias de treino contínuo. Fotografe o corpo no dia 1, 30, 60 e 100 sob a mesma luz e ângulo. A transformação é prova, não palavras.",
        steps: [
          "Escolhe um programa de treino com progressão de carga (não improvise).",
          "Fotografa de frente, de lado e de costas no dia 1 — guarda para ti.",
          "Regista o treino em papel ou app. O que não é medido não é gerido.",
        ],
      }}
    >
      <AuraCalendarAlert storageKey="aura.corpo.alert" title="Esfoliação Corporal" defaultFrequency={7} />
      <ProductCatalog
        storageKey="aura.corpo.catalog"
        categories={["Armadura da Pele"] as ProductCategory[]}
        defaultProducts={[
          { name: "Hidratante Corporal Nivea (400ml)", category: "Armadura da Pele", investment: "Acessível", investmentValue: "R$ 25 - R$ 45", season: "Diário · Pós-banho", ritual: "Aplique no corpo ainda ligeiramente úmido após o banho. Movimentos ascendentes para estimular a circulação. Foco em cotovelos, joelhos e calcanhares.", rating: 5 },
          { name: "Esfoliante Corporal (sal ou açúcar)", category: "Armadura da Pele", investment: "Acessível", investmentValue: "R$ 20 - R$ 50", season: "Semanal · No Banho", ritual: "Aplique no corpo molhado em movimentos circulares antes do sabonete. Foco nos cotovelos, joelhos e calcanhares. Enxágue completamente.", rating: 4 },
          { name: "Sabonete Corporal Dove / Granado", category: "Armadura da Pele", investment: "Acessível", investmentValue: "R$ 10 - R$ 20", season: "Diário · Banho", ritual: "Use esponja macia ou mãos. Comece pelo pescoço, desça pelo torso. Atenção às axilas, virilha e entre os dedos dos pés.", rating: 4 },
          { name: "Desodorante Antitranspirante Roll-On", category: "Armadura da Pele", investment: "Acessível", investmentValue: "R$ 10 - R$ 25", season: "Diário · Pós-banho", ritual: "Aplique nas axilas limpas e completamente secas. A eficácia cai se aplicado sobre suor. Aguarde 2 minutos antes de vestir.", rating: 5 },
          { name: "Protetor Solar Corporal FPS 30+", category: "Armadura da Pele", investment: "Acessível", investmentValue: "R$ 30 - R$ 60", season: "Exposição ao Sol · Obrigatório", ritual: "Aplique generosamente 20 minutos antes da exposição solar. Reaplique a cada 2h ou após transpiração intensa. Não negligencie pescoço e braços.", rating: 5 },
        ]}
      />
    </AuraSection>
  ),
});
