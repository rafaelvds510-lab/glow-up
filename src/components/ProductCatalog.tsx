import { useState, useEffect, useRef } from "react";

export type ProductCategory = "Assinatura Invisível" | "Armadura da Pele" | "Cuidado Capilar";
export type InvestmentTier = "Acessível" | "Moderado" | "Linha de Elite";
export type SeasonOccasion = string;

export type Product = {
  id: string;
  name: string;
  category: ProductCategory;
  investment: InvestmentTier;
  investmentValue?: string;
  season: SeasonOccasion;
  ritual: string;
  rating: number;
  imageBase64?: string;
  purchaseLink?: string;
  custom?: boolean;
};

function StarRating({ value, onChange }: { value: number; onChange?: (v: number) => void }) {
  const [hover, setHover] = useState(0);
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => onChange?.(star === value ? 0 : star)}
          onMouseEnter={() => onChange && setHover(star)}
          onMouseLeave={() => onChange && setHover(0)}
          className={`text-xl leading-none transition-transform ${
            onChange ? "cursor-pointer hover:scale-110" : "cursor-default"
          } ${star <= (hover || value) ? "text-[var(--gold)]" : "text-muted-foreground/30"}`}
          aria-label={`${star} estrela${star > 1 ? "s" : ""}`}
        >
          ★
        </button>
      ))}
      <span className="ml-1.5 text-xs text-muted-foreground font-mono">
        {value > 0 ? `${value}.0` : "—"}
      </span>
    </div>
  );
}

const TIER_STYLE: Record<InvestmentTier, string> = {
  Acessível: "bg-emerald-500/10 text-emerald-700 border-emerald-500/30",
  Moderado: "bg-[var(--gold)]/10 text-[var(--aegean)] border-[var(--gold)]/40",
  "Linha de Elite": "bg-purple-500/10 text-purple-700 border-purple-500/30",
};

const CAT_BADGE: Record<ProductCategory, string> = {
  "Assinatura Invisível": "🫧",
  "Armadura da Pele": "🛡️",
  "Cuidado Capilar": "✂️",
};

type FilterOption = "Todos" | ProductCategory;

function compressImage(file: File): Promise<string> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const MAX = 600;
        let w = img.width, h = img.height;
        if (w > MAX) { h = Math.round((h * MAX) / w); w = MAX; }
        canvas.width = w; canvas.height = h;
        canvas.getContext("2d")!.drawImage(img, 0, 0, w, h);
        resolve(canvas.toDataURL("image/jpeg", 0.75));
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  });
}

export function ProductCatalog({
  storageKey,
  defaultProducts,
  categories,
}: {
  storageKey: string;
  defaultProducts: Omit<Product, "id" | "custom">[];
  categories: ProductCategory[];
}) {
  const [products, setProducts] = useState<Product[]>(() => {
    if (typeof window === "undefined") return [];
    try {
      const raw = localStorage.getItem(storageKey);
      if (raw) {
        return JSON.parse(raw);
      }
    } catch {}
    const seeded: Product[] = defaultProducts.map((p, i) => ({ ...p, id: `default-${i}`, custom: false }));
    return seeded;
  });
  const [filter, setFilter] = useState<FilterOption>("Todos");
  const [adding, setAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const [dName, setDName] = useState("");
  const [dCat, setDCat] = useState<ProductCategory>(categories[0]);
  const [dInv, setDInv] = useState<InvestmentTier>("Moderado");
  const [dInvVal, setDInvVal] = useState("");
  const [dSeason, setDSeason] = useState("");
  const [dRitual, setDRitual] = useState("");
  const [dRating, setDRating] = useState(0);
  const [dImage, setDImage] = useState("");
  const [dLink, setDLink] = useState("");

  useEffect(() => {
    try {
      const raw = localStorage.getItem(storageKey);
      if (raw) {
        setProducts(JSON.parse(raw));
      } else {
        const seeded: Product[] = defaultProducts.map((p, i) => ({ ...p, id: `default-${i}`, custom: false }));
        setProducts(seeded);
        localStorage.setItem(storageKey, JSON.stringify(seeded));
      }
    } catch {
      const seeded: Product[] = defaultProducts.map((p, i) => ({ ...p, id: `default-${i}`, custom: false }));
      setProducts(seeded);
    }
  }, [storageKey]);

  const save = (list: Product[]) => {
    setProducts(list);
    localStorage.setItem(storageKey, JSON.stringify(list));
  };

  const resetForm = () => {
    setDName(""); setDCat(categories[0]); setDInv("Moderado");
    setDInvVal(""); setDSeason(""); setDRitual(""); setDRating(0);
    setDImage(""); setDLink(""); setEditingId(null); setAdding(false);
  };

  const startEdit = (p: Product) => {
    setDName(p.name); setDCat(p.category); setDInv(p.investment);
    setDInvVal(p.investmentValue || ""); setDSeason(p.season);
    setDRitual(p.ritual); setDRating(p.rating);
    setDImage(p.imageBase64 || ""); setDLink(p.purchaseLink || "");
    setEditingId(p.id); setAdding(true);
  };

  const onSubmit = () => {
    if (!dName.trim()) return;
    const payload = {
      name: dName, category: dCat, investment: dInv,
      investmentValue: dInvVal, season: dSeason, ritual: dRitual,
      rating: dRating, imageBase64: dImage || undefined,
      purchaseLink: dLink.trim() || undefined,
    };
    if (editingId) {
      save(products.map((p) => p.id === editingId ? { ...p, ...payload } : p));
    } else {
      save([...products, { ...payload, id: Math.random().toString(36).slice(2), custom: true }]);
    }
    resetForm();
  };

  const onRate = (id: string, v: number) => save(products.map((p) => p.id === id ? { ...p, rating: v } : p));
  const onDelete = (id: string) => save(products.filter((p) => p.id !== id));

  const visible = filter === "Todos" ? products : products.filter((p) => p.category === filter);

  return (
    <section className="mx-auto max-w-5xl px-6 py-12">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 border-b border-border pb-4">
        <h3 className="font-display text-3xl text-[var(--aegean)]">Acervo de Produtos</h3>
        <button
          onClick={() => adding ? resetForm() : setAdding(true)}
          className="px-4 py-2 text-xs uppercase tracking-widest border border-[var(--gold)] text-[var(--aegean)] hover:bg-[var(--gold)]/10 transition-colors"
        >
          {adding ? "Cancelar" : "+ Adicionar"}
        </button>
      </div>

      {/* Filter Chips */}
      <div className="flex flex-wrap gap-2 mb-8">
        {(["Todos", ...categories] as FilterOption[]).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-1.5 text-xs uppercase tracking-widest border transition-all ${
              filter === f
                ? "border-[var(--gold)] bg-[var(--gold)]/15 text-[var(--aegean)] font-bold"
                : "border-border text-muted-foreground hover:border-[var(--gold)] hover:text-[var(--aegean)]"
            }`}
          >
            {f !== "Todos" && CAT_BADGE[f as ProductCategory]} {f}
          </button>
        ))}
      </div>

      {/* Form */}
      {adding && (
        <div className="border border-[var(--gold)]/50 bg-card p-6 mb-10">
          <p className="label-eyebrow mb-5">{editingId ? "Editar Produto" : "Novo Produto"}</p>
          
          {/* Image Upload */}
          <div className="mb-5">
            <label className="text-[10px] uppercase opacity-70 block mb-2">Foto do Produto</label>
            <div className="flex items-start gap-4">
              <div
                className="w-32 h-32 border-2 border-dashed border-border flex items-center justify-center cursor-pointer hover:bg-muted/20 transition-colors overflow-hidden bg-muted/10 shrink-0"
                style={{ backgroundImage: dImage ? `url(${dImage})` : 'none', backgroundSize: 'cover', backgroundPosition: 'center' }}
                onClick={() => fileRef.current?.click()}
              >
                {!dImage && <span className="text-xs text-muted-foreground text-center leading-relaxed">Toque<br/>para foto</span>}
              </div>
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={async (e) => {
                  if (e.target.files?.[0]) {
                    const b64 = await compressImage(e.target.files[0]);
                    setDImage(b64);
                  }
                }}
              />
              {dImage && (
                <button onClick={() => setDImage("")} className="text-xs text-destructive hover:underline">
                  Remover foto
                </button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-[10px] uppercase opacity-70">Nome</label>
              <input value={dName} onChange={(e) => setDName(e.target.value)} placeholder="Ex: Bleu de Chanel EDP"
                className="border border-border bg-background px-3 py-2 text-sm outline-none focus:border-[var(--gold)]" />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-[10px] uppercase opacity-70">Categoria</label>
              <select value={dCat} onChange={(e) => setDCat(e.target.value as ProductCategory)}
                className="border border-border bg-background px-3 py-2 text-sm outline-none focus:border-[var(--gold)]">
                {categories.map((c) => (<option key={c} value={c}>{CAT_BADGE[c]} {c}</option>))}
              </select>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-[10px] uppercase opacity-70">Faixa de Investimento</label>
              <select value={dInv} onChange={(e) => setDInv(e.target.value as InvestmentTier)}
                className="border border-border bg-background px-3 py-2 text-sm outline-none focus:border-[var(--gold)]">
                <option>Acessível</option>
                <option>Moderado</option>
                <option>Linha de Elite</option>
              </select>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-[10px] uppercase opacity-70">Valor Estimado (opcional)</label>
              <input value={dInvVal} onChange={(e) => setDInvVal(e.target.value)} placeholder="Ex: R$ 350 - R$ 450"
                className="border border-border bg-background px-3 py-2 text-sm outline-none focus:border-[var(--gold)]" />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-[10px] uppercase opacity-70">Estação / Ocasião</label>
              <input value={dSeason} onChange={(e) => setDSeason(e.target.value)} placeholder="Ex: Verão · Encontro Noturno"
                className="border border-border bg-background px-3 py-2 text-sm outline-none focus:border-[var(--gold)]" />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-[10px] uppercase opacity-70">Link para Compra (opcional)</label>
              <input value={dLink} onChange={(e) => setDLink(e.target.value)} placeholder="https://..."
                type="url"
                className="border border-border bg-background px-3 py-2 text-sm outline-none focus:border-[var(--gold)]" />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-[10px] uppercase opacity-70">Avaliação</label>
              <div className="pt-1"><StarRating value={dRating} onChange={setDRating} /></div>
            </div>
            <div className="md:col-span-2 flex flex-col gap-1">
              <label className="text-[10px] uppercase opacity-70">O Ritual — Como Usar</label>
              <textarea value={dRitual} onChange={(e) => setDRitual(e.target.value)} rows={3}
                placeholder="Instrução estratégica de aplicação..."
                className="border border-border bg-background px-3 py-2 text-sm resize-none outline-none focus:border-[var(--gold)]" />
            </div>
          </div>
          <div className="mt-5 flex justify-end">
            <button onClick={onSubmit} disabled={!dName.trim()}
              className="px-8 py-3 bg-[var(--aegean)] text-white text-xs uppercase tracking-widest hover:opacity-90 disabled:opacity-40 transition">
              {editingId ? "Salvar Alterações" : "Adicionar ao Acervo"}
            </button>
          </div>
        </div>
      )}

      {/* Product Grid */}
      {visible.length === 0 ? (
        <div className="border border-dashed border-border py-16 text-center">
          <p className="italic text-muted-foreground">Nenhum produto nesta categoria ainda.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {visible.map((p) => (
            <article key={p.id}
              className="border-t-2 border border-[var(--gold)]/60 bg-card flex flex-col group relative hover:shadow-lg transition-shadow overflow-hidden"
            >
              {/* Product Image */}
              {p.imageBase64 && (
                <div className="h-52 w-full bg-white flex items-center justify-center overflow-hidden border-b border-border/40">
                  <img
                    src={p.imageBase64}
                    alt={p.name}
                    className="max-h-full max-w-full object-contain p-3"
                  />
                </div>
              )}

              <div className="p-6 flex flex-col gap-4 flex-1">
                {/* Top controls */}
                <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2 bg-card/80 backdrop-blur-sm px-2 py-1">
                  <button onClick={() => startEdit(p)}
                    className="text-[10px] uppercase tracking-widest text-[var(--aegean)] hover:underline">
                    Editar
                  </button>
                  {p.custom && (
                    <button onClick={() => onDelete(p.id)}
                      className="text-[10px] uppercase tracking-widest text-destructive hover:underline">
                      Excluir
                    </button>
                  )}
                </div>

                {/* Category + Tier */}
                <div className="flex items-start justify-between gap-2 flex-wrap">
                  <span className="text-xs font-bold tracking-wider text-[var(--terracotta)] uppercase">
                    {CAT_BADGE[p.category]} {p.category}
                  </span>
                  <span className={`text-[10px] px-2 py-0.5 border rounded-full uppercase tracking-wider font-semibold ${TIER_STYLE[p.investment]}`}>
                    {p.investment}
                  </span>
                </div>

                {/* Name + Meta */}
                <div>
                  <h4 className="font-display text-2xl text-[var(--aegean)] leading-tight">{p.name}</h4>
                  <p className="text-xs text-muted-foreground mt-1">🗓 {p.season || "—"}</p>
                  {p.investmentValue && (
                    <p className="text-xs font-mono text-muted-foreground mt-0.5">💰 {p.investmentValue}</p>
                  )}
                </div>

                {/* Ritual */}
                <blockquote className="border-l-2 border-[var(--gold)] pl-4 text-sm italic text-[var(--aegean)]/80 leading-relaxed">
                  "{p.ritual}"
                </blockquote>

                {/* Footer: Stars + Buy Link */}
                <div className="border-t border-border/60 pt-3 mt-auto flex items-center justify-between gap-3 flex-wrap">
                  <StarRating value={p.rating} onChange={(v) => onRate(p.id, v)} />
                  {p.purchaseLink && (
                    <a
                      href={p.purchaseLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[10px] uppercase tracking-widest border border-[var(--gold)] px-3 py-1.5 text-[var(--aegean)] hover:bg-[var(--gold)]/10 transition-colors"
                    >
                      🛒 Comprar
                    </a>
                  )}
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
