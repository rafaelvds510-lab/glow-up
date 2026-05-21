// Pillar registry — agrupa rotas e missões por pilar para o dashboard de Ascensão.
import { MISSIONS, type MissionMeta } from "@/lib/missions";

export type PillarKey = "aura" | "verbo" | "estrategia";

export type Pillar = {
  key: PillarKey;
  name: string;
  motto: string;
  pages: { path: string; label: string }[];
  missionIds: string[];
  hub: string;
};

export const PILLARS: Pillar[] = [
  {
    key: "aura",
    name: "Aura",
    motto: "Estética, presença e o silêncio que precede a palavra.",
    hub: "/aura",
    pages: [
      { path: "/aura", label: "Visão geral" },
      { path: "/aura/barba", label: "Barba" },
      { path: "/aura/cabelo", label: "Cabelo" },
      { path: "/aura/vestuario", label: "Vestuário" },
      { path: "/aura/perfume", label: "Perfume" },
      { path: "/aura/acessorios", label: "Acessórios" },
      { path: "/aura/skincare", label: "Skincare" },
      { path: "/aura/postura", label: "Postura" },
    ],
    missionIds: MISSIONS.filter((m) => m.pillar.startsWith("Aura")).map((m) => m.id),
  },
  {
    key: "verbo",
    name: "Verbo",
    motto: "A voz que comanda salas e suaviza muros.",
    hub: "/verbo",
    pages: [{ path: "/verbo", label: "Tratado do Verbo" }],
    missionIds: [],
  },
  {
    key: "estrategia",
    name: "Estratégia",
    motto: "Psicologia aplicada — ler o tabuleiro antes de mover a peça.",
    hub: "/estrategia",
    pages: [
      { path: "/estrategia", label: "Tratado da Estratégia" },
      { path: "/biblioteca", label: "Biblioteca" },
      { path: "/mentor", label: "Mentor IA" },
      { path: "/habitos", label: "Hábitos diários" },
    ],
    missionIds: [],
  },
];

export type PillarProgress = {
  pillar: Pillar;
  pagesDone: number;
  pagesTotal: number;
  missionsDone: number;
  missionsTotal: number;
  pct: number; // 0–100
  nextPages: { path: string; label: string }[];
  nextMissions: MissionMeta[];
};

export function computePillarProgress(
  pillar: Pillar,
  pagesVisited: string[],
  missionsDone: string[],
): PillarProgress {
  const pagesDoneList = pillar.pages.filter((p) => pagesVisited.includes(p.path));
  const missionsDoneList = pillar.missionIds.filter((id) => missionsDone.includes(id));

  const pagesPct = pillar.pages.length ? pagesDoneList.length / pillar.pages.length : 1;
  const missionsPct = pillar.missionIds.length
    ? missionsDoneList.length / pillar.missionIds.length
    : pagesPct; // sem missões: usa páginas
  // peso 40% páginas, 60% missões (quando há missões)
  const pct = pillar.missionIds.length
    ? Math.round((pagesPct * 0.4 + missionsPct * 0.6) * 100)
    : Math.round(pagesPct * 100);

  const nextPages = pillar.pages.filter((p) => !pagesVisited.includes(p.path)).slice(0, 3);
  const nextMissions = pillar.missionIds
    .filter((id) => !missionsDone.includes(id))
    .map((id) => MISSIONS.find((m) => m.id === id)!)
    .filter(Boolean)
    .slice(0, 3);

  return {
    pillar,
    pagesDone: pagesDoneList.length,
    pagesTotal: pillar.pages.length,
    missionsDone: missionsDoneList.length,
    missionsTotal: pillar.missionIds.length,
    pct,
    nextPages,
    nextMissions,
  };
}
