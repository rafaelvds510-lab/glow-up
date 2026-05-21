// Módulo de Leituras — estado local (sem backend)

export type ReadingStatus = "quero" | "lendo" | "lido";

export type ReadingEntry = {
  title: string;
  author: string;
  status: ReadingStatus;
  currentPage: number;
  totalPages: number;
  updatedAt: string;
  fileUrl?: string;
  fileExt?: string;
};

const KEY = "santuario.leituras.v1";

export function loadLeituras(): Record<string, ReadingEntry> {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function saveLeituras(map: Record<string, ReadingEntry>) {
  try {
    localStorage.setItem(KEY, JSON.stringify(map));
    window.dispatchEvent(new CustomEvent("leituras:update"));
  } catch {}
}

export function upsertLeitura(key: string, patch: Partial<ReadingEntry> & Pick<ReadingEntry, "title" | "author">) {
  const map = loadLeituras();
  const prev = map[key];
  const next: ReadingEntry = {
    title: patch.title,
    author: patch.author,
    status: patch.status ?? prev?.status ?? "quero",
    currentPage: patch.currentPage ?? prev?.currentPage ?? 0,
    totalPages: patch.totalPages ?? prev?.totalPages ?? 0,
    fileUrl: patch.fileUrl ?? prev?.fileUrl,
    fileExt: patch.fileExt ?? prev?.fileExt,
    updatedAt: new Date().toISOString(),
  };
  if (next.totalPages > 0 && next.currentPage >= next.totalPages) {
    next.currentPage = next.totalPages;
    next.status = "lido";
  }
  const delta = next.currentPage - (prev?.currentPage ?? 0);
  map[key] = next;
  saveLeituras(map);
  if (delta > 0) {
    // log pages read this month
    import("./biblioteca-state").then((m) => m.addPagesRead(delta));
  }
  return next;
}

export function removeLeitura(key: string) {
  const map = loadLeituras();
  delete map[key];
  saveLeituras(map);
}

export function pctRead(e: ReadingEntry): number {
  if (!e.totalPages) return e.status === "lido" ? 100 : 0;
  return Math.min(100, Math.round((e.currentPage / e.totalPages) * 100));
}

export const STATUS_LABEL: Record<ReadingStatus, string> = {
  quero: "Quero ler",
  lendo: "Lendo",
  lido: "Lido",
};
