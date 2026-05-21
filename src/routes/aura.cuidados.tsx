import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";

export const Route = createFileRoute("/aura/cuidados")({
  head: () => ({
    meta: [
      { title: "Cuidados & Fragrâncias — Product Analyzer | Santuário do Glow-up" },
      { name: "description", content: "Análise refinada de cosméticos e fragrâncias para a estética clássica." },
    ],
  }),
  component: ProductAnalyzer,
});

type Product = {
  name: string;
  category: "Fragrâncias" | "Cuidados com a Pele";
  type: string;
  priceRange: string;
  idealSeason: string;
  howToUse: string;
};

const products: Product[] = [
  {
    name: "Bleu de Chanel",
    category: "Fragrâncias",
    type: "Eau de Parfum",
    priceRange: "R$ 700 - R$ 900",
    idealSeason: "Todas as estações (Altamente Versátil)",
    howToUse: "Aplique nos pontos de pulsação (laterais do pescoço e pulsos) logo após o banho com a pele hidratada para maximizar a fixação."
  },
  {
    name: "CeraVe Loção Hidratante Facial",
    category: "Cuidados com a Pele",
    type: "Hidratante com Ácido Hialurônico e Ceramidas",
    priceRange: "R$ 70 - R$ 90",
    idealSeason: "Todas as estações (Diário)",
    howToUse: "Massageie suavemente sobre o rosto limpo e seco pela manhã e à noite antes de dormir. Não obstrui os poros."
  },
  {
    name: "Terre d'Hermès",
    category: "Fragrâncias",
    type: "Eau de Toilette (Amadeirado Mineral)",
    priceRange: "R$ 600 - R$ 800",
    idealSeason: "Outono / Primavera (Dia e Noite)",
    howToUse: "Borrife de 3 a 4 vezes formando uma nuvem sobre o peito e ombros. Exala maturidade, sofisticação e presença telúrica."
  },
  {
    name: "Protetor Solar La Roche-Posay Anthelios",
    category: "Cuidados com a Pele",
    type: "Protetor Facial de Alta Proteção FPS 60",
    priceRange: "R$ 80 - R$ 100",
    idealSeason: "Verão / Diário (Obrigatório)",
    howToUse: "Aplique uniformemente no rosto e pescoço 15 minutos antes da exposição solar. Reaplique a cada 4 horas se exposto."
  },
  {
    name: "Acqua di Giò Profondo",
    category: "Fragrâncias",
    type: "Eau de Parfum (Cítrico Aquático)",
    priceRange: "R$ 650 - R$ 850",
    idealSeason: "Verão / Dias quentes",
    howToUse: "Perfeito para dias ensolarados. Borrife nas clavículas e nuca. O frescor oceânico cria um rastro limpo e marcante."
  },
  {
    name: "Gel de Limpeza Facial Granado Antiacne",
    category: "Cuidados com a Pele",
    type: "Sabonete Líquido Facial Purificante",
    priceRange: "R$ 40 - R$ 60",
    idealSeason: "Todas as estações",
    howToUse: "Lave o rosto de manhã e à noite fazendo movimentos circulares suaves. Enxágue abundantemente com água fria."
  }
];

export function ProductAnalyzer() {
  const [filter, setFilter] = useState<"Todos" | "Fragrâncias" | "Cuidados com a Pele">("Todos");

  const filteredProducts = products.filter((p) => {
    if (filter === "Todos") return true;
    return p.category === filter;
  });

  return (
    <div className="mx-auto max-w-6xl px-6 py-12">
      <div className="text-center mb-10">
        <span className="label-eyebrow">Cosmética Clássica</span>
        <h3 className="font-display text-4xl text-[var(--aegean)] mt-2">Product Analyzer</h3>
        <p className="mt-3 text-sm text-muted-foreground max-w-xl mx-auto">
          Uma curadoria cirúrgica dos melhores produtos de cuidado e fragrâncias para erguer sua presença e proteger a sua pele.
        </p>
      </div>

      {/* Barra de Filtro */}
      <div className="flex justify-center gap-4 mb-12">
        {(["Todos", "Fragrâncias", "Cuidados com a Pele"] as const).map((cat) => (
          <button
            key={cat}
            onClick={() => setFilter(cat)}
            className={`border px-5 py-2.5 text-xs uppercase tracking-widest transition-all ${
              filter === cat
                ? "border-[var(--gold)] bg-[var(--gold)]/10 text-[var(--aegean)] font-bold shadow-[0_0_12px_rgba(212,175,55,0.2)]"
                : "border-border text-muted-foreground hover:border-[var(--gold)] hover:text-[var(--aegean)]"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Grid de Produtos */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProducts.map((p) => (
          <article
            key={p.name}
            style={{ backgroundColor: "var(--marble)", borderColor: "var(--gold)" }}
            className="border-t-2 border bg-card p-6 flex flex-col justify-between shadow-sm hover:shadow-md transition-shadow duration-300"
          >
            <div>
              <div className="flex justify-between items-start gap-2 mb-4">
                <span className="text-[10px] uppercase tracking-widest text-[var(--terracotta)] font-bold">
                  {p.category}
                </span>
                <span className="text-xs italic text-muted-foreground">
                  {p.idealSeason}
                </span>
              </div>

              <h4 className="font-display text-2xl text-[var(--aegean)] leading-tight mb-1">
                {p.name}
              </h4>
              <p className="text-xs text-muted-foreground font-mono mb-4">
                {p.type}
              </p>

              <div className="mt-4 border-t border-border/40 pt-4">
                <span className="text-[10px] uppercase tracking-wider text-muted-foreground block mb-2">Instruções de Uso</span>
                <blockquote className="border-l-2 border-[var(--gold)] pl-3 italic text-sm text-[var(--aegean)]/90 my-2">
                  "{p.howToUse}"
                </blockquote>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-border/40 flex justify-between items-center text-xs">
              <span className="text-muted-foreground uppercase tracking-widest">Preço Estimado</span>
              <span className="font-bold text-[var(--aegean)] font-mono">{p.priceRange}</span>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
