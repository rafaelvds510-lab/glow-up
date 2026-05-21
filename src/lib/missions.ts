// Registry of all field missions across the Santuário.
// Used by FieldReportCard to display rich history.

export type MissionMeta = {
  id: string;
  title: string;
  pillar: string;
  href: string;
};

export const MISSIONS: MissionMeta[] = [
  { id: "barba-1", title: "Cartografia da Barba", pillar: "Aura · Barba", href: "/aura/barba" },
  { id: "cabelo-1", title: "A Coroa Refeita", pillar: "Aura · Cabelo", href: "/aura/cabelo" },
  { id: "vestuario-1", title: "Auditoria do Guarda-Roupa", pillar: "Aura · Vestuário", href: "/aura/vestuario" },
  { id: "perfume-1", title: "As Três Notas", pillar: "Aura · Perfume", href: "/aura/perfume" },
  { id: "acessorios-1", title: "A Assinatura Discreta", pillar: "Aura · Acessórios", href: "/aura/acessorios" },
  { id: "skincare-1", title: "O Espelho Honesto", pillar: "Aura · Skincare", href: "/aura/skincare" },
  { id: "postura-1", title: "A Presença do Cônsul", pillar: "Aura · Postura", href: "/aura/postura" },
];

export function getMissionMeta(id: string): MissionMeta {
  return (
    MISSIONS.find((m) => m.id === id) ?? {
      id,
      title: id,
      pillar: "Missão",
      href: "/ascensao",
    }
  );
}

export function loadFieldNote(id: string): string {
  if (typeof window === "undefined") return "";
  try {
    return localStorage.getItem(`santuario.fieldnote.${id}`) ?? "";
  } catch {
    return "";
  }
}
