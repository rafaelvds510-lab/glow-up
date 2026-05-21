import { createFileRoute } from "@tanstack/react-router";
import { AuraSection } from "@/components/AuraSection";
import { ProductCatalog, type ProductCategory } from "@/components/ProductCatalog";

export const Route = createFileRoute("/aura/perfume")({
  head: () => ({
    meta: [
      { title: "Perfume — A Assinatura Invisível | Santuário do Glow-up" },
      { name: "description", content: "Notas olfativas, ocasiões e os pontos estratégicos de aplicação." },
    ],
  }),
  component: () => (
    <AuraSection
      pageKey="aura/perfume"
      eyebrow="Aura · IV"
      title="A Assinatura Invisível"
      intro="O perfume é a memória que deixas no ar quando já não estás. Não se ouve, mas se grava — escolhe o que queres ser lembrado."

      ritual={[
        "Aplica em pele hidratada — fixa o dobro.",
        "2 a 4 borrifos no máximo. Mais é agressão olfativa.",
        "Guarda longe de luz e calor — gaveta fechada.",
        "Renova a fragrância sazonalmente: cítrico no verão, âmbar no inverno.",
      ]}
      mission={{
        id: "perfume-1",
        title: "Vai a uma perfumaria",
        brief: "Visita uma perfumaria hoje. Identifica três notas de base diferentes em três fragrâncias distintas. Regista a tua experiência.",
        steps: [
          "Leva folhas de teste (blotters) — não testes mais de 4 fragrâncias na pele.",
          "Anota: nome, família olfativa, notas de topo / coração / base.",
          "Espera 30 minutos. A nota de base é o que persiste — é essa que escolhes.",
        ],
      }}
    >
      <ProductCatalog
        storageKey="aura.perfume.catalog"
        categories={["Assinatura Invisível"] as ProductCategory[]}
        defaultProducts={[
          { name: "Essencial Único Natura", category: "Assinatura Invisível", investment: "Acessível", investmentValue: "R$ 180 - R$ 220", season: "Encontro Noturno · Todas as Estações", ritual: "Borrife nos pulsos e na lateral do pescoço após o banho. A fixação melhora em pele hidratada.", rating: 4 },
          { name: "Dior Homme Intense", category: "Assinatura Invisível", investment: "Linha de Elite", investmentValue: "R$ 700 - R$ 900", season: "Outono/Inverno · Evento Formal", ritual: "2 borrifos no peito e 1 na nuca. Deixa o sillage definir a tua presença — não exageres.", rating: 5 },
          { name: "Acqua di Giò Profondo", category: "Assinatura Invisível", investment: "Moderado", investmentValue: "R$ 400 - R$ 550", season: "Verão · Trabalho e Lazer", ritual: "Borrife nas clavículas para um rastro marinho fresco e limpo. Ideal para dias quentes.", rating: 4 },
          { name: "Club de Nuit Elixir Armaf", category: "Assinatura Invisível", investment: "Acessível", investmentValue: "R$ 200 - R$ 280", season: "Outono · Encontro e Eventos", ritual: "3 borrifos — peito, pulso e nuca. Alta fixação. Usado em pele seca, dura até 12h.", rating: 5 },
          { name: "Khamrah Lattafa", category: "Assinatura Invisível", investment: "Acessível", investmentValue: "R$ 150 - R$ 200", season: "Inverno · Noite · Intimidade", ritual: "1-2 borrifos no peito. Notas orientais intensas — ocasiões íntimas e fechadas apenas.", rating: 4 },
          { name: "Naxos Xerjoff", category: "Assinatura Invisível", investment: "Linha de Elite", investmentValue: "R$ 1.200 - R$ 1.800", season: "Outono/Primavera · Evento de Prestígio", ritual: "1 borrijo no pulso. Deixa as notas de baunilha e lavanda projetarem sozinhas. Menos é mais.", rating: 5 },
        ]}
      />
    </AuraSection>
  ),
});

