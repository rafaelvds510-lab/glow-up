// Sistema de Progresso local (sem backend)
// Páginas visitadas e missões cumpridas.

export type AscensaoState = {
  pagesVisited: string[]; // path keys
  missionsDone: string[]; // mission ids
};

const KEY = "santuario.ascensao.v1";

const empty: AscensaoState = {
  pagesVisited: [],
  missionsDone: [],
};

export function loadState(): AscensaoState {
  if (typeof window === "undefined") return empty;
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return empty;
    return { ...empty, ...JSON.parse(raw) };
  } catch {
    return empty;
  }
}

export function saveState(s: AscensaoState) {
  try {
    localStorage.setItem(KEY, JSON.stringify(s));
    window.dispatchEvent(new CustomEvent("ascensao:update"));
  } catch {}
}

export function visitPage(path: string) {
  const s = loadState();
  if (s.pagesVisited.includes(path)) return;
  s.pagesVisited = [...s.pagesVisited, path];
  saveState(s);
}

export function toggleMission(id: string): boolean {
  const s = loadState();
  const has = s.missionsDone.includes(id);
  if (has) {
    s.missionsDone = s.missionsDone.filter((m) => m !== id);
  } else {
    s.missionsDone = [...s.missionsDone, id];
  }
  saveState(s);
  return !has;
}

export function resetAscensao() {
  saveState({ ...empty });
}

