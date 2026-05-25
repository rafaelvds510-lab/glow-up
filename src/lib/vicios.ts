// Módulo de Vícios (Libertação/Purificação) — estado local

export type Vicio = {
  id: string;
  name: string;
  createdAt: string; // ISO string
  relapses: string[]; // Array de datas ISO de recaídas
};

const KEY = "santuario.vicios.v1";

export function loadVicios(): Vicio[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveVicios(vicios: Vicio[]) {
  try {
    localStorage.setItem(KEY, JSON.stringify(vicios));
    window.dispatchEvent(new CustomEvent("vicios:update"));
  } catch {}
}

export function addVicio(name: string): Vicio {
  const vicios = loadVicios();
  const novo: Vicio = {
    id: Math.random().toString(36).substring(2, 9) + Date.now().toString(36),
    name,
    createdAt: new Date().toISOString(),
    relapses: [],
  };
  vicios.push(novo);
  saveVicios(vicios);
  return novo;
}

export function addRelapse(id: string) {
  const vicios = loadVicios();
  const vicio = vicios.find((v) => v.id === id);
  if (vicio) {
    vicio.relapses.push(new Date().toISOString());
    saveVicios(vicios);
  }
}

export function removeVicio(id: string) {
  const vicios = loadVicios();
  const filtrados = vicios.filter((v) => v.id !== id);
  saveVicios(filtrados);
}

export function editVicio(id: string, newName: string) {
  const vicios = loadVicios();
  const vicio = vicios.find((v) => v.id === id);
  if (vicio) {
    vicio.name = newName;
    saveVicios(vicios);
  }
}

// Retorna a quantidade de dias desde a última recaída ou desde a criação
export function getDaysClean(vicio: Vicio, today: Date = new Date()): number {
  const lastDateStr =
    vicio.relapses.length > 0
      ? vicio.relapses[vicio.relapses.length - 1]
      : vicio.createdAt;

  const lastDate = new Date(lastDateStr);
  const diffTime = today.getTime() - lastDate.getTime();
  return Math.floor(diffTime / (1000 * 60 * 60 * 24));
}

// Filtra apenas os vícios ativos (menos de 90 dias limpos)
export function getActiveVicios(vicios: Vicio[], today: Date = new Date()): Vicio[] {
  return vicios.filter((v) => getDaysClean(v, today) < 90);
}
