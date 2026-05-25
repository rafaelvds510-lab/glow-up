// Módulo de Identidade — Retrato, Atributos (RPG) e Diário.
// 100% local (localStorage). Sem backend.

export type AttrKey =
  | "coragem"
  | "disciplina"
  | "empatia"
  | "eloquencia"
  | "presenca"
  | "estrategia";

export const ATTR_META: Record<AttrKey, { label: string; motto: string }> = {
  coragem:    { label: "Coragem",    motto: "Agir antes da certeza." },
  disciplina: { label: "Disciplina", motto: "O hábito que vence o humor." },
  empatia:    { label: "Empatia",    motto: "Ler o outro sem te perderes." },
  eloquencia: { label: "Eloquência", motto: "A palavra exacta no instante exacto." },
  presenca:   { label: "Presença",   motto: "Ocupar o espaço sem o invadir." },
  estrategia: { label: "Estratégia", motto: "Ver o tabuleiro inteiro." },
};

export const ATTR_KEYS = Object.keys(ATTR_META) as AttrKey[];
export const ATTR_MAX = 10;

export type Portrait = {
  nome: string;
  idade: string;
  foto: string;
  proposito: string;
  valores: string[];   // até 5
  forcas: string[];    // até 3
  sombras: string[];   // até 3
  updatedAt: string;
};

export type DiaryEntry = {
  id: string;
  date: string;          // ISO date
  attribute: AttrKey | null;
  quality: string;       // qualidade exercitada
  reflection: string;    // texto livre
};

export type IdentidadeState = {
  portrait: Portrait;
  attrs: Record<AttrKey, number>; // 1..10
  diary: DiaryEntry[];
};

const KEY = "santuario.identidade.v1";

const emptyPortrait: Portrait = {
  nome: "",
  idade: "",
  foto: "",
  proposito: "",
  valores: [],
  forcas: [],
  sombras: [],
  updatedAt: new Date(0).toISOString(),
};

const emptyAttrs = ATTR_KEYS.reduce(
  (acc, k) => ({ ...acc, [k]: 1 }),
  {} as Record<AttrKey, number>,
);

const empty: IdentidadeState = {
  portrait: emptyPortrait,
  attrs: emptyAttrs,
  diary: [],
};

export function loadIdentidade(): IdentidadeState {
  if (typeof window === "undefined") return empty;
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return empty;
    const parsed = JSON.parse(raw) as Partial<IdentidadeState>;
    return {
      portrait: { ...emptyPortrait, ...(parsed.portrait ?? {}) },
      attrs: { ...emptyAttrs, ...(parsed.attrs ?? {}) },
      diary: parsed.diary ?? [],
    };
  } catch {
    return empty;
  }
}

export function saveIdentidade(s: IdentidadeState) {
  try {
    localStorage.setItem(KEY, JSON.stringify(s));
    window.dispatchEvent(new CustomEvent("identidade:update"));
  } catch {}
}

export function savePortrait(p: Partial<Portrait>) {
  const s = loadIdentidade();
  s.portrait = { ...s.portrait, ...p, updatedAt: new Date().toISOString() };
  saveIdentidade(s);
}

export function trainAttr(key: AttrKey, delta: number = 1) {
  const s = loadIdentidade();
  const next = Math.max(1, Math.min(ATTR_MAX, (s.attrs[key] ?? 1) + delta));
  s.attrs[key] = next;
  saveIdentidade(s);
}

export function addDiary(entry: Omit<DiaryEntry, "id" | "date"> & { date?: string }) {
  const s = loadIdentidade();
  const item: DiaryEntry = {
    id: crypto.randomUUID?.() ?? String(Date.now()),
    date: entry.date ?? new Date().toISOString(),
    attribute: entry.attribute,
    quality: entry.quality,
    reflection: entry.reflection,
  };
  s.diary = [item, ...s.diary].slice(0, 500);
  // Bónus simbólico: registar no diário também treina o atributo (+1).
  if (item.attribute) {
    s.attrs[item.attribute] = Math.min(
      ATTR_MAX,
      (s.attrs[item.attribute] ?? 1) + 1,
    );
  }
  saveIdentidade(s);
  return item;
}

export function removeDiary(id: string) {
  const s = loadIdentidade();
  s.diary = s.diary.filter((e) => e.id !== id);
  saveIdentidade(s);
}

export function identidadeCompletude(s: IdentidadeState): number {
  const p = s.portrait;
  let score = 0;
  if (p.nome.trim()) score += 10;
  if (p.proposito.trim().length > 20) score += 25;
  score += Math.min(25, p.valores.length * 5);
  score += Math.min(15, p.forcas.length * 5);
  score += Math.min(15, p.sombras.length * 5);
  const avg = ATTR_KEYS.reduce((a, k) => a + s.attrs[k], 0) / ATTR_KEYS.length;
  score += Math.min(10, Math.round(avg));
  return Math.min(100, score);
}
