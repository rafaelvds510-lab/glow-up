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
    
    console.log("[Sync] Dados sincronizados com a nuvem com sucesso.");
    return true;
  } catch (error) {
    console.error("[Sync] Falha na comunicação com Supabase:", error);
    return false;
  }
}

// Pulls state from Supabase and overwrites local storage
export async function pullSyncData() {
  const session = await supabase.auth.getSession();
  const userId = session.data.session?.user?.id;
  
  if (!userId) return false;

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
      localStorage.setItem("santuario.biblioteca.v1", JSON.stringify(data.biblioteca));
    }

    console.log("[Sync] Dados restaurados da nuvem com sucesso.");
    
    // Dispara eventos para a UI atualizar
    window.dispatchEvent(new Event("storage"));
    window.dispatchEvent(new CustomEvent("identidade:update"));
    window.dispatchEvent(new CustomEvent("ascensao:update"));
    
    return true;
  } catch (error) {
    console.error("[Sync] Falha ao recuperar dados do Supabase:", error);
    return false;
  }
}

// Escuta mudanças de localStorage e salva na nuvem (debounce de 3s para evitar spam)
let syncTimeout: any = null;
export function setupAutoSync() {
  if (typeof window === "undefined") return;
  
  const handleStorageChange = (e?: any) => {
    // Se o evento foi disparado pelo nosso próprio pullSyncData, ignoramos
    if (e && e.key === null) return;
    
    if (syncTimeout) clearTimeout(syncTimeout);
    syncTimeout = setTimeout(() => {
      pushSyncData();
    }, 3000);
  };

  window.addEventListener("storage", handleStorageChange);
  
  // Custom events usados pelo app
  const customEvents = [
    "identidade:update", 
    "ascensao:update", 
    "habitos:update", 
    "vicios:update",
    "leituras:update"
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
