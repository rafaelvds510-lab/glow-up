import { supabase } from "@/integrations/supabase/client";

// Define the keys we care about syncing
const SYNC_KEYS = [
  "santuario.identidade.v1",
  "santuario.habitos.v1",
  "santuario.habitos.groups.v1",
  "santuario.vicios.v1",
  "santuario.leituras.v1",
  "santuario.frases.v1",
  "santuario.biblioteca.v1",
  "santuario.ascensao.v1"
];

// Pushes all local state to Supabase
export async function pushSyncData() {
  const session = await supabase.auth.getSession();
  const userId = session.data.session?.user?.id;
  
  if (!userId) return false;

  const dataToSync: Record<string, any> = {};
  
  // Extract all data from localStorage
  for (const key of SYNC_KEYS) {
    const raw = localStorage.getItem(key);
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        // Map the local storage key to the database column
        const column = key.replace("santuario.", "").replace(".v1", "").replace(".groups", "_groups");
        dataToSync[column] = parsed;
      } catch (e) {
        console.error("Failed to parse local data for key", key, e);
      }
    }
  }

  // Se houver hábitos de grupos, junta com os hábitos
  if (dataToSync.habitos_groups) {
    dataToSync.habitos = {
      items: dataToSync.habitos || [],
      groups: dataToSync.habitos_groups
    };
    delete dataToSync.habitos_groups;
  }
  
  if (dataToSync.ascensao) {
    dataToSync.identidade = {
      ...dataToSync.identidade,
      ascensao: dataToSync.ascensao
    };
    delete dataToSync.ascensao;
  }

  // Agrupa os dados de favoritos, meta e log da biblioteca
  const bibliotecaData: Record<string, any> = {};
  const favs = localStorage.getItem("santuario.favoritos.v1");
  const meta = localStorage.getItem("santuario.meta-mensal.v1");
  const log = localStorage.getItem("santuario.paginas-log.v1");
  if (favs) {
    try { bibliotecaData.favoritos = JSON.parse(favs); } catch {}
  }
  if (meta) {
    const parsedMeta = Number(meta);
    if (!isNaN(parsedMeta)) bibliotecaData.meta_mensal = parsedMeta;
  }
  if (log) {
    try { bibliotecaData.paginas_log = JSON.parse(log); } catch {}
  }
  if (Object.keys(bibliotecaData).length > 0) {
    dataToSync.biblioteca = bibliotecaData;
  }

  try {
    const { error } = await (supabase as any)
      .from('user_sync_data')
      .upsert({
        user_id: userId,
        identidade: dataToSync.identidade || {},
        habitos: dataToSync.habitos || {},
        vicios: dataToSync.vicios || {},
        leituras: dataToSync.leituras || {},
        frases: dataToSync.frases || {},
        biblioteca: dataToSync.biblioteca || {},
      });

    if (error) {
      console.error("[Sync] Erro ao enviar dados para a nuvem:", error);
      return false;
    }
    
    localStorage.removeItem("santuario.dirty");
    console.log("[Sync] Dados sincronizados com a nuvem com sucesso.");
    return true;
  } catch (error) {
    console.error("[Sync] Falha na comunicação com Supabase:", error);
    return false;
  }
}

let isPulling = false;

// Pulls state from Supabase and overwrites local storage
export async function pullSyncData() {
  const session = await supabase.auth.getSession();
  const userId = session.data.session?.user?.id;
  
  if (!userId) return false;

  isPulling = true;
  try {
    const { data, error } = await (supabase as any)
      .from('user_sync_data')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error || !data) {
      console.log("[Sync] Nenhum dado encontrado na nuvem para este usuário.");
      return false;
    }

    // Save to localStorage
    if (data.identidade && Object.keys(data.identidade).length > 0) {
      const { ascensao, ...identidadeOnly } = data.identidade as any;
      localStorage.setItem("santuario.identidade.v1", JSON.stringify(identidadeOnly));
      if (ascensao) localStorage.setItem("santuario.ascensao.v1", JSON.stringify(ascensao));
    }
    
    if (data.habitos && Object.keys(data.habitos).length > 0) {
      const habitosData = data.habitos as any;
      if (habitosData.items) {
        localStorage.setItem("santuario.habitos.v1", JSON.stringify(habitosData.items));
      } else {
        localStorage.setItem("santuario.habitos.v1", JSON.stringify(habitosData));
      }
      
      if (habitosData.groups) {
        localStorage.setItem("santuario.habitos.groups.v1", JSON.stringify(habitosData.groups));
      }
    }

    if (data.vicios && Object.keys(data.vicios).length > 0) {
      localStorage.setItem("santuario.vicios.v1", JSON.stringify(data.vicios));
    }

    if (data.leituras && Object.keys(data.leituras).length > 0) {
      localStorage.setItem("santuario.leituras.v1", JSON.stringify(data.leituras));
    }

    if (data.frases && Object.keys(data.frases).length > 0) {
      localStorage.setItem("santuario.frases.v1", JSON.stringify(data.frases));
    }

    if (data.biblioteca && Object.keys(data.biblioteca).length > 0) {
      const bib = data.biblioteca as any;
      if (bib.favoritos) {
        localStorage.setItem("santuario.favoritos.v1", JSON.stringify(bib.favoritos));
      }
      if (bib.meta_mensal !== undefined) {
        localStorage.setItem("santuario.meta-mensal.v1", String(bib.meta_mensal));
      }
      if (bib.paginas_log) {
        localStorage.setItem("santuario.paginas-log.v1", JSON.stringify(bib.paginas_log));
      }
      localStorage.setItem("santuario.biblioteca.v1", JSON.stringify(bib));
    }

    console.log("[Sync] Dados restaurados da nuvem com sucesso.");
    
    // Dispara eventos para a UI atualizar
    window.dispatchEvent(new Event("storage"));
    window.dispatchEvent(new CustomEvent("identidade:update"));
    window.dispatchEvent(new CustomEvent("ascensao:update"));
    window.dispatchEvent(new CustomEvent("favoritos:update"));
    window.dispatchEvent(new CustomEvent("meta:update"));
    window.dispatchEvent(new CustomEvent("paginas:update"));
    window.dispatchEvent(new CustomEvent("frases:update"));
    window.dispatchEvent(new CustomEvent("habitos:update"));
    window.dispatchEvent(new CustomEvent("vicios:update"));
    window.dispatchEvent(new CustomEvent("leituras:update"));
    
    // Removemos o dirty logo após o pull para garantir que não mandamos de volta
    localStorage.removeItem("santuario.dirty");
    
    return true;
  } catch (error) {
    console.error("[Sync] Falha ao recuperar dados do Supabase:", error);
    return false;
  } finally {
    setTimeout(() => { isPulling = false; }, 1000);
  }
}

// Escuta mudanças de localStorage e salva na nuvem (debounce de 3s para evitar spam)
let syncTimeout: any = null;
export function setupAutoSync() {
  if (typeof window === "undefined") return;
  
  const handleStorageChange = (e?: any) => {
    // Se está puxando da nuvem, ignora esses eventos para não gerar loop
    if (isPulling) return;
    
    if (e && e.key === null) return;
    
    // Marca que temos dados locais não salvos na nuvem
    localStorage.setItem("santuario.dirty", "true");
    
    if (syncTimeout) clearTimeout(syncTimeout);
    syncTimeout = setTimeout(() => {
      pushSyncData();
    }, 1000);
  };

  window.addEventListener("storage", handleStorageChange);
  
  // Custom events usados pelo app
  const customEvents = [
    "identidade:update", 
    "ascensao:update", 
    "habitos:update", 
    "vicios:update",
    "leituras:update",
    "frases:update",
    "favoritos:update",
    "meta:update",
    "paginas:update"
  ];
  
  for (const event of customEvents) {
    window.addEventListener(event, handleStorageChange);
  }

  return () => {
    window.removeEventListener("storage", handleStorageChange);
    for (const event of customEvents) {
      window.removeEventListener(event, handleStorageChange);
    }
    if (syncTimeout) clearTimeout(syncTimeout);
  };
}
