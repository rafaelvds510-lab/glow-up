import { supabase } from "@/integrations/supabase/client";

// Chaves do localStorage que fazem parte do sync
const SYNC_KEYS = [
  "santuario.identidade.v1",
  "santuario.habitos.v1",
  "santuario.habitos.groups.v1",
  "santuario.vicios.v1",
  "santuario.leituras.v1",
  "santuario.frases.v1",
  "santuario.biblioteca.v1",
  "santuario.ascensao.v1",
  "santuario.favoritos.v1",
  "santuario.meta-mensal.v1",
  "santuario.paginas-log.v1",
];

/** Retorna o userId da sessão ativa, ou null */
async function getUserId(): Promise<string | null> {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    return session?.user?.id ?? null;
  } catch {
    return null;
  }
}

/** Monta o payload completo a partir do localStorage */
function buildPayload(userId: string) {
  // Hábitos
  let habitosGroups: any[] = [];
  let habitosHistory: Record<string, any> = {};
  try {
    const raw = localStorage.getItem("santuario.habitos.v1");
    if (raw) {
      const parsed = JSON.parse(raw);
      habitosHistory = parsed.history ?? {};
    }
  } catch {}
  try {
    const raw = localStorage.getItem("santuario.habitos.groups.v1");
    if (raw) habitosGroups = JSON.parse(raw);
  } catch {}

  // Identidade + Ascensão
  let identidade: Record<string, any> = {};
  try {
    const raw = localStorage.getItem("santuario.identidade.v1");
    if (raw) identidade = JSON.parse(raw);
  } catch {}
  try {
    const raw = localStorage.getItem("santuario.ascensao.v1");
    if (raw) identidade.ascensao = JSON.parse(raw);
  } catch {}

  // Vícios
  let vicios: any = {};
  try {
    const raw = localStorage.getItem("santuario.vicios.v1");
    if (raw) vicios = JSON.parse(raw);
  } catch {}

  // Leituras
  let leituras: any = {};
  try {
    const raw = localStorage.getItem("santuario.leituras.v1");
    if (raw) leituras = JSON.parse(raw);
  } catch {}

  // Frases
  let frases: any = {};
  try {
    const raw = localStorage.getItem("santuario.frases.v1");
    if (raw) frases = JSON.parse(raw);
  } catch {}

  // Biblioteca
  let biblioteca: Record<string, any> = {};
  try {
    const raw = localStorage.getItem("santuario.biblioteca.v1");
    if (raw) biblioteca = { ...JSON.parse(raw) };
  } catch {}
  try {
    const favs = localStorage.getItem("santuario.favoritos.v1");
    if (favs) biblioteca.favoritos = JSON.parse(favs);
  } catch {}
  try {
    const meta = localStorage.getItem("santuario.meta-mensal.v1");
    if (meta !== null) biblioteca.meta_mensal = Number(meta);
  } catch {}
  try {
    const log = localStorage.getItem("santuario.paginas-log.v1");
    if (log) biblioteca.paginas_log = JSON.parse(log);
  } catch {}

  return {
    user_id: userId,
    identidade,
    habitos: { groups: habitosGroups, history: habitosHistory },
    vicios,
    leituras,
    frases,
    biblioteca,
  };
}

/** Envia todos os dados locais para o Supabase */
export async function pushSyncData(): Promise<boolean> {
  const userId = await getUserId();
  if (!userId) {
    console.warn("[Sync] Não autenticado — push ignorado.");
    return false;
  }

  const payload = buildPayload(userId);
  console.log("[Sync] Enviando dados para a nuvem...", payload);

  try {
    const { error } = await (supabase
      .from("user_sync_data" as any) as any)
      .upsert(payload, { onConflict: "user_id" });

    if (error) {
      console.error("[Sync] Erro no push:", error.message, error);
      return false;
    }

    localStorage.removeItem("santuario.dirty");
    console.log("[Sync] ✅ Dados salvos na nuvem com sucesso.");
    return true;
  } catch (err) {
    console.error("[Sync] Falha na comunicação:", err);
    return false;
  }
}

let _isPulling = false;

/** Restaura os dados da nuvem para o localStorage e atualiza a UI */
export async function pullSyncData(): Promise<boolean> {
  const userId = await getUserId();
  if (!userId) {
    console.warn("[Sync] Não autenticado — pull ignorado.");
    return false;
  }

  _isPulling = true;
  console.log("[Sync] Buscando dados da nuvem...");

  try {
    const { data, error } = await (supabase
      .from("user_sync_data" as any)
      .select("*")
      .eq("user_id", userId)
      .maybeSingle() as any);

    if (error) {
      console.error("[Sync] Erro no pull:", error.message, error);
      return false;
    }

    if (!data) {
      console.log("[Sync] Nenhum dado na nuvem para este usuário — usando localStorage.");
      return false;
    }

    console.log("[Sync] Dados recebidos da nuvem:", data);

    // Identidade + Ascensão
    if (data.identidade && typeof data.identidade === "object") {
      const { ascensao, ...identOnly } = data.identidade as any;
      if (Object.keys(identOnly).length > 0)
        localStorage.setItem("santuario.identidade.v1", JSON.stringify(identOnly));
      if (ascensao)
        localStorage.setItem("santuario.ascensao.v1", JSON.stringify(ascensao));
    }

    // Hábitos — estrutura: { groups: [], history: {} }
    if (data.habitos && typeof data.habitos === "object") {
      const h = data.habitos as any;
      // groups
      if (Array.isArray(h.groups)) {
        localStorage.setItem("santuario.habitos.groups.v1", JSON.stringify(h.groups));
        console.log("[Sync] Grupos de hábitos restaurados:", h.groups.length, "pilares");
      }
      // history
      if (h.history && typeof h.history === "object") {
        localStorage.setItem("santuario.habitos.v1", JSON.stringify({ history: h.history }));
      }
    }

    // Vícios
    if (data.vicios && Object.keys(data.vicios).length > 0)
      localStorage.setItem("santuario.vicios.v1", JSON.stringify(data.vicios));

    // Leituras
    if (data.leituras && Object.keys(data.leituras).length > 0)
      localStorage.setItem("santuario.leituras.v1", JSON.stringify(data.leituras));

    // Frases
    if (data.frases && Object.keys(data.frases).length > 0)
      localStorage.setItem("santuario.frases.v1", JSON.stringify(data.frases));

    // Biblioteca
    if (data.biblioteca && typeof data.biblioteca === "object") {
      const bib = data.biblioteca as any;
      if (bib.favoritos) localStorage.setItem("santuario.favoritos.v1", JSON.stringify(bib.favoritos));
      if (bib.meta_mensal !== undefined) localStorage.setItem("santuario.meta-mensal.v1", String(bib.meta_mensal));
      if (bib.paginas_log) localStorage.setItem("santuario.paginas-log.v1", JSON.stringify(bib.paginas_log));
      localStorage.setItem("santuario.biblioteca.v1", JSON.stringify(bib));
    }

    localStorage.removeItem("santuario.dirty");

    // Notifica todos os componentes para re-ler o localStorage
    const events = [
      "habitos:update",
      "vicios:update",
      "leituras:update",
      "frases:update",
      "identidade:update",
      "ascensao:update",
      "favoritos:update",
      "meta:update",
      "paginas:update",
      "storage",
    ];
    for (const evt of events) {
      window.dispatchEvent(evt === "storage" ? new Event("storage") : new CustomEvent(evt));
    }

    console.log("[Sync] ✅ Dados restaurados da nuvem com sucesso.");
    return true;
  } catch (err) {
    console.error("[Sync] Falha ao puxar dados:", err);
    return false;
  } finally {
    setTimeout(() => { _isPulling = false; }, 2000);
  }
}

// ─── Auto-sync ────────────────────────────────────────────────
let _syncTimer: ReturnType<typeof setTimeout> | null = null;

/** Escuta mudanças e salva na nuvem com debounce de 2s */
export function setupAutoSync(): () => void {
  if (typeof window === "undefined") return () => {};

  const schedule = () => {
    if (_isPulling) return; // Não salva enquanto está puxando da nuvem
    localStorage.setItem("santuario.dirty", "true");
    if (_syncTimer) clearTimeout(_syncTimer);
    _syncTimer = setTimeout(() => {
      pushSyncData().catch(console.error);
    }, 2000);
  };

  const CUSTOM_EVENTS = [
    "habitos:update",
    "vicios:update",
    "leituras:update",
    "frases:update",
    "identidade:update",
    "ascensao:update",
    "favoritos:update",
    "meta:update",
    "paginas:update",
  ];

  window.addEventListener("storage", schedule);
  for (const evt of CUSTOM_EVENTS) window.addEventListener(evt, schedule);

  return () => {
    window.removeEventListener("storage", schedule);
    for (const evt of CUSTOM_EVENTS) window.removeEventListener(evt, schedule);
    if (_syncTimer) clearTimeout(_syncTimer);
  };
}
