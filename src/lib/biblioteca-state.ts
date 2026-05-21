// Favoritos & lista de desejo (livros da biblioteca curada)

const FAV_KEY = "santuario.favoritos.v1";

export function loadFavoritos(): string[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(FAV_KEY) ?? "[]");
  } catch {
    return [];
  }
}

export function toggleFavorito(key: string) {
  const list = loadFavoritos();
  const next = list.includes(key) ? list.filter((k) => k !== key) : [...list, key];
  localStorage.setItem(FAV_KEY, JSON.stringify(next));
  window.dispatchEvent(new CustomEvent("favoritos:update"));
  return next;
}

export function isFavorito(key: string): boolean {
  return loadFavoritos().includes(key);
}

// Meta mensal de páginas
const GOAL_KEY = "santuario.meta-mensal.v1";

export function loadMetaMensal(): number {
  if (typeof window === "undefined") return 0;
  try {
    return Number(localStorage.getItem(GOAL_KEY)) || 0;
  } catch {
    return 0;
  }
}

export function saveMetaMensal(n: number) {
  localStorage.setItem(GOAL_KEY, String(Math.max(0, Math.floor(n))));
  window.dispatchEvent(new CustomEvent("meta:update"));
}

// Histórico mensal de páginas lidas — registado a cada incremento
const PAGES_LOG_KEY = "santuario.paginas-log.v1";

export type PagesLog = Record<string, number>; // YYYY-MM -> total pages

export function loadPagesLog(): PagesLog {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(localStorage.getItem(PAGES_LOG_KEY) ?? "{}");
  } catch {
    return {};
  }
}

export function addPagesRead(delta: number) {
  if (delta <= 0) return;
  const log = loadPagesLog();
  const month = new Date().toISOString().slice(0, 7);
  log[month] = (log[month] ?? 0) + delta;
  localStorage.setItem(PAGES_LOG_KEY, JSON.stringify(log));
  window.dispatchEvent(new CustomEvent("paginas:update"));
}

export function pagesThisMonth(): number {
  const month = new Date().toISOString().slice(0, 7);
  return loadPagesLog()[month] ?? 0;
}
