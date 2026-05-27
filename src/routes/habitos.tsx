import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { PageShell, PageHero } from "@/components/PageShell";
import { useVisitPage } from "@/hooks/useAscensao";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/habitos")({
  head: () => ({
    meta: [
      { title: "Hábitos — Ritual Diário | Santuário do Glow-up" },
      { name: "description", content: "Checklist diário de hábitos para esculpir corpo, voz e mente." },
      { property: "og:title", content: "Hábitos — Ritual Diário" },
      { property: "og:description", content: "Disciplina é a oração dos antigos." },
    ],
  }),
  component: Habitos,
});

const defaultGroups = [
  {
    pillar: "Higiene",
    items: [],
  },
  {
    pillar: "Aura",
    items: [],
  },
  {
    pillar: "Verbo",
    items: [],
  }
];

const STORAGE_KEY = "santuario.habitos.v1";
const GROUPS_KEY = "santuario.habitos.groups.v1";

function todayKey() {
  return new Date().toISOString().slice(0, 10);
}

function Habitos() {
  useVisitPage("habitos");
  
  const [groups, setGroups] = useState<Array<{ pillar: string; items: string[] }>>(() => {
    if (typeof window === "undefined") return defaultGroups;
    try {
      const savedGroups = localStorage.getItem(GROUPS_KEY);
      if (savedGroups) return JSON.parse(savedGroups);
    } catch {}
    return defaultGroups;
  });
  const [history, setHistory] = useState<Record<string, Record<string, 'green' | 'red'>>>(() => {
    if (typeof window === "undefined") return {};
    try {
      const raw = localStorage.getItem("santuario.habitos.v1");
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed.date && parsed.done && !parsed.history) {
          const mig: Record<string, 'green'> = {};
          for (const [k, v] of Object.entries(parsed.done)) if (v) mig[k] = 'green';
          return { [parsed.date]: mig };
        }
        return parsed.history ?? {};
      }
    } catch {}
    return {};
  });
  const [date, setDate] = useState(todayKey());
  const [newItemText, setNewItemText] = useState("");
  const [editingPillar, setEditingPillar] = useState<string | null>(null);
  const [renamingItem, setRenamingItem] = useState<{ pillar: string; item: string } | null>(null);
  const [renameText, setRenameText] = useState("");

  // --- Notificações Push ---
  const [notifPermission, setNotifPermission] = useState<NotificationPermission>("default");
  const [notifTime, setNotifTime] = useState(() =>
    typeof window !== "undefined" ? localStorage.getItem("santuario.notif.time") || "08:00" : "08:00"
  );
  const [notifEnabled, setNotifEnabled] = useState(() =>
    typeof window !== "undefined" && localStorage.getItem("santuario.notif.enabled") === "true"
  );
  const [showNotifPanel, setShowNotifPanel] = useState(false);

  useEffect(() => {
    if ("Notification" in window) setNotifPermission(Notification.permission);
  }, []);

  const scheduleNotif = (time: string) => {
    if (typeof window === "undefined" || !("Notification" in window) || Notification.permission !== "granted") return;
    const [h, m] = time.split(":").map(Number);
    const now = new Date();
    const target = new Date();
    target.setHours(h, m, 0, 0);
    if (target.getTime() <= now.getTime()) target.setDate(target.getDate() + 1);
    const delay = target.getTime() - now.getTime();
    setTimeout(() => {
      new Notification("Santuário do Glow-up 🏛️", {
        body: "Hora do ritual diário! Complete seus hábitos e construa seu legado.",
        icon: "/icons/icon-192.png",
      });
    }, delay);
    localStorage.setItem("santuario.notif.enabled", "true");
    localStorage.setItem("santuario.notif.time", time);
    setNotifEnabled(true);
  };

  const handleRequestNotif = async () => {
    if (!("Notification" in window)) {
      alert("Seu navegador não suporta notificações push.");
      return;
    }
    const perm = await Notification.requestPermission();
    setNotifPermission(perm);
    if (perm === "granted") scheduleNotif(notifTime);
  };

  const handleToggleNotif = () => {
    if (notifEnabled) {
      setNotifEnabled(false);
      localStorage.setItem("santuario.notif.enabled", "false");
    } else {
      if (notifPermission === "granted") scheduleNotif(notifTime);
      else handleRequestNotif();
    }
  };

  useEffect(() => {
    try {
      const savedGroups = localStorage.getItem(GROUPS_KEY);
      if (savedGroups) setGroups(JSON.parse(savedGroups));
      setDate(todayKey());
    } catch {}
  }, []);

  useEffect(() => {
    const sync = () => {
      try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw) {
          const parsed = JSON.parse(raw);
          setHistory(parsed.history ?? {});
        }
      } catch {}
    };
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener("storage", sync);
    };
  }, []);

  // Sincroniza local e nuvem via CustomEvent
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ history }));
      localStorage.setItem(GROUPS_KEY, JSON.stringify(groups));
      window.dispatchEvent(new CustomEvent("habitos:update"));
    } catch {}
  }, [history, groups]);

  const setHabitState = (k: string, state: 'green' | 'red') => setHistory((prev) => {
    const todayHistory = prev[date] || {};
    // Se clicar no mesmo estado, remove (toggle off)
    const newState = todayHistory[k] === state ? undefined : state;
    const nextToday = { ...todayHistory };
    if (newState) nextToday[k] = newState;
    else delete nextToday[k];
    
    const next = { ...prev, [date]: nextToday };
    return next;
  });

  const addItem = (pillar: string) => {
    if (!newItemText.trim()) return;
    setGroups(prev => prev.map(g => {
      if (g.pillar === pillar && !g.items.includes(newItemText.trim())) {
        return { ...g, items: [...g.items, newItemText.trim()] };
      }
      return g;
    }));
    setNewItemText("");
    setEditingPillar(null);
  };

  const removeItem = (pillar: string, item: string) => {
    setGroups(prev => prev.map(g => {
      if (g.pillar === pillar) return { ...g, items: g.items.filter(i => i !== item) };
      return g;
    }));
  };

  const startRename = (pillar: string, item: string) => {
    setRenamingItem({ pillar, item });
    setRenameText(item);
  };

  const confirmRename = () => {
    if (!renamingItem) return;
    const newName = renameText.trim();
    if (!newName || newName === renamingItem.item) { setRenamingItem(null); return; }
    // Atualiza grupos
    setGroups(prev => prev.map(g => {
      if (g.pillar !== renamingItem.pillar) return g;
      return { ...g, items: g.items.map(i => i === renamingItem.item ? newName : i) };
    }));
    // Migra histórico para a nova chave
    setHistory(prev => {
      const next: typeof prev = {};
      for (const [day, dayMap] of Object.entries(prev)) {
        const newDay: Record<string, 'green' | 'red'> = { ...dayMap };
        if (renamingItem.item in newDay) {
          newDay[newName] = newDay[renamingItem.item];
          delete newDay[renamingItem.item];
        }
        next[day] = newDay;
      }
      return next;
    });
    setRenamingItem(null);
  };

  const moveItem = (pillar: string, index: number, dir: -1 | 1) => {
    setGroups(prev => prev.map(g => {
      if (g.pillar !== pillar) return g;
      if (index + dir < 0 || index + dir >= g.items.length) return g;
      const newItems = [...g.items];
      [newItems[index], newItems[index + dir]] = [newItems[index + dir], newItems[index]];
      return { ...g, items: newItems };
    }));
  };

  const all = groups.flatMap((g) => g.items);
  const todayDone = history[date] || {};
  const completed = all.filter((i) => todayDone[i] === 'green').length;
  const pct = all.length > 0 ? Math.round((completed / all.length) * 100) : 0;

  // Últimos 10 dias e Próximos 10 dias
  const daysArray = Array.from({ length: 21 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + (i - 10));
    return d.toISOString().slice(0, 10);
  });

  return (
    <PageShell>
      <PageHero
        eyebrow="Ritual diário"
        title="A oração dos antigos"
        intro="Disciplina não é castigo — é o ritmo pelo qual o templo se ergue, pedra após pedra."
      />

      <section className="mx-auto max-w-5xl px-6 py-12">
        <div className="border border-border bg-card p-6">
          <div className="flex items-center justify-between text-sm">
            <span className="label-eyebrow">Progresso de hoje</span>
            <span className="font-display text-3xl text-primary">{pct}% <span className="text-xl text-muted-foreground">({completed}/{all.length})</span></span>
          </div>
          <div className="mt-4 h-2 w-full bg-border rounded-full overflow-hidden">
            <div className="h-full bg-primary transition-all" style={{ width: `${pct}%` }} />
          </div>
        </div>

        {/* Gráfico Geral de 21 dias */}
        <div className="mt-6 border border-border bg-card p-6 overflow-x-auto">
          <p className="label-eyebrow mb-6">Gráfico Geral (10 dias antes / 10 dias depois)</p>
          <div className="relative min-w-max h-48 flex">
            {/* Eixo Y (0 a 100) */}
            <div className="flex flex-col justify-between text-[10px] text-muted-foreground pr-4 pb-6 font-mono text-right w-10 border-r border-border mr-2 h-full">
              <span>100</span>
              <span>75</span>
              <span>50</span>
              <span>25</span>
              <span>0</span>
            </div>
            
            {/* Área do Gráfico */}
            <div className="relative flex-1 flex gap-2 h-full pb-6">
              {/* Linhas de Grade */}
              <div className="absolute inset-0 pb-6 flex flex-col justify-between pointer-events-none z-0">
                <div className="w-full border-t border-border/40" />
                <div className="w-full border-t border-border/40" />
                <div className="w-full border-t border-border/40" />
                <div className="w-full border-t border-border/40" />
                <div className="w-full border-t border-border/40" />
              </div>

              {daysArray.map(d => {
                const dayHistory = history[d] || {};
                const c = all.filter(i => dayHistory[i] === 'green').length;
                const p = all.length > 0 ? (c / all.length) * 100 : 0;
                const isToday = d === date;
                return (
                  <div key={d} className="flex-1 flex flex-col justify-end items-center group relative z-10 w-8 h-full">
                    <div className={`w-full transition-all rounded-t-sm ${isToday ? 'bg-primary' : 'bg-primary/40'}`} style={{ height: `${p}%`, minHeight: p > 0 ? '4px' : '0' }} />
                    <span className={`absolute -bottom-6 text-[10px] ${isToday ? 'text-primary font-bold' : 'text-muted-foreground'}`}>{d.slice(8,10)}</span>
                    <div className="absolute bottom-full mb-1 hidden group-hover:block bg-popover text-popover-foreground text-xs px-2 py-1 rounded shadow z-20 whitespace-nowrap">
                      {d.split('-').reverse().join('/')}: {Math.round(p)}%
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-6 pb-24">
        {/* Barra de Notificações */}
        <div className="mb-6 flex items-center justify-between border border-border bg-card px-4 py-3">
          <div className="flex items-center gap-3">
            <span className="text-xl">{notifEnabled ? "🔔" : "🔕"}</span>
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest">Lembretes diários</p>
              <p className="text-[10px] text-muted-foreground">
                {notifEnabled ? `Ativo · ${notifTime}` : "Desativado"}
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowNotifPanel(!showNotifPanel)}
            className="text-xs uppercase tracking-widest text-primary hover:underline"
          >
            {showNotifPanel ? "Fechar" : "Configurar"}
          </button>
        </div>

        {showNotifPanel && (
          <div className="mb-6 border border-border bg-card p-5 space-y-4">
            {notifPermission === "denied" ? (
              <p className="text-xs text-destructive">
                Notificações bloqueadas. Ative nas configurações do seu navegador ou SO.
              </p>
            ) : (
              <>
                <div className="flex items-center gap-4">
                  <label className="text-xs uppercase tracking-widest text-muted-foreground shrink-0">Horário</label>
                  <input
                    type="time"
                    value={notifTime}
                    onChange={(e) => {
                      setNotifTime(e.target.value);
                      localStorage.setItem("santuario.notif.time", e.target.value);
                    }}
                    className="border border-border bg-background px-3 py-1.5 text-sm text-foreground focus:outline-none focus:border-primary"
                  />
                </div>
                <button
                  onClick={handleToggleNotif}
                  className={`w-full py-3 text-sm uppercase tracking-widest font-semibold transition ${
                    notifEnabled
                      ? "border border-destructive/40 text-destructive hover:bg-destructive/10"
                      : "bg-primary text-primary-foreground hover:bg-primary/90"
                  }`}
                >
                  {notifEnabled
                    ? "Desativar lembrete"
                    : notifPermission === "granted"
                    ? "Ativar lembrete"
                    : "Permitir notificações"}
                </button>
                {notifEnabled && (
                  <p className="text-center text-xs text-muted-foreground">
                    ✓ Lembrete diário ativado às {notifTime}
                  </p>
                )}
              </>
            )}
          </div>
        )}

        {groups.map((g) => (
          <div key={g.pillar}>
            <div className="flex items-center justify-between">
              <p className="label-eyebrow">Pilar · {g.pillar}</p>
              <button 
                onClick={() => setEditingPillar(editingPillar === g.pillar ? null : g.pillar)}
                className="text-xs uppercase tracking-widest text-primary hover:underline"
              >
                {editingPillar === g.pillar ? "Fechar" : "Adicionar Hábito"}
              </button>
            </div>
            
            {editingPillar === g.pillar && (
              <div className="mt-4 flex gap-2">
                <input 
                  type="text" 
                  value={newItemText} 
                  onChange={(e) => setNewItemText(e.target.value)} 
                  placeholder="Novo hábito..." 
                  className="flex-1 border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
                  onKeyDown={(e) => e.key === 'Enter' && addItem(g.pillar)}
                />
                <button 
                  onClick={() => addItem(g.pillar)}
                  className="border border-primary bg-primary/10 px-4 py-2 text-xs uppercase tracking-widest text-primary hover:bg-primary/20"
                >
                  Salvar
                </button>
              </div>
            )}
            
            <ul className="mt-4 divide-y divide-border border-y border-border">
              {g.items.map((it, idx) => {
                const state = todayDone[it];
                return (
                  <li key={it} className="group py-3 px-3 transition hover:bg-muted/40">
                    {/* Linha principal: nome + botões de check */}
                    <div className="flex items-center gap-2 min-w-0">
                      {/* Nome do hábito — normal ou modo edição */}
                      {renamingItem?.pillar === g.pillar && renamingItem?.item === it ? (
                        <div className="flex flex-1 min-w-0 items-center gap-2">
                          <input
                            autoFocus
                            type="text"
                            value={renameText}
                            onChange={e => setRenameText(e.target.value)}
                            onKeyDown={e => { if (e.key === 'Enter') confirmRename(); if (e.key === 'Escape') setRenamingItem(null); }}
                            className="flex-1 min-w-0 text-base bg-transparent border-b border-primary outline-none text-foreground"
                          />
                          <button onClick={confirmRename} className="shrink-0 text-xs uppercase tracking-widest text-primary border border-primary px-2 py-1 hover:bg-primary/10 transition">OK</button>
                          <button onClick={() => setRenamingItem(null)} className="shrink-0 text-xs text-muted-foreground hover:text-foreground">✕</button>
                        </div>
                      ) : (
                        <span className={`flex-1 min-w-0 text-sm md:text-base font-medium leading-snug ${
                          state === 'green' ? 'text-muted-foreground line-through' : 'text-foreground'
                        }`}>
                          {it}
                        </span>
                      )}

                      {/* Botões de check — tamanho reduzido para caber no mobile */}
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          onClick={() => setHabitState(it, 'green')}
                          className={`w-8 h-8 flex items-center justify-center rounded-full border text-xs font-bold transition-colors ${
                            state === 'green'
                              ? 'bg-green-600 border-green-600 text-white'
                              : 'border-border text-muted-foreground hover:border-green-600 hover:text-green-600'
                          }`}
                          title="Feito"
                        >✓</button>
                        <button
                          onClick={() => setHabitState(it, 'red')}
                          className={`w-8 h-8 flex items-center justify-center rounded-full border text-xs font-bold transition-colors ${
                            state === 'red'
                              ? 'bg-red-600 border-red-600 text-white'
                              : 'border-border text-muted-foreground hover:border-red-600 hover:text-red-600'
                          }`}
                          title="Falhou"
                        >✕</button>
                      </div>

                      {/* Ações de edição — só no desktop (hover) */}
                      <div className="opacity-0 group-hover:opacity-100 hidden md:flex items-center gap-1 transition-opacity shrink-0">
                        <button onClick={() => moveItem(g.pillar, idx, -1)} className="p-1 text-muted-foreground hover:text-primary text-xs">▲</button>
                        <button onClick={() => moveItem(g.pillar, idx, 1)} className="p-1 text-muted-foreground hover:text-primary text-xs">▼</button>
                        <button onClick={() => startRename(g.pillar, it)} className="px-2 text-xs uppercase tracking-widest text-primary hover:underline">Renomear</button>
                        <button onClick={() => removeItem(g.pillar, it)} className="px-2 text-xs uppercase tracking-widest text-destructive hover:underline">Remover</button>
                      </div>
                    </div>

                    {/* Ações de edição — mobile (linha separada, sempre visível) */}
                    <div className="mt-1 flex items-center gap-3 md:hidden">
                      <button onClick={() => moveItem(g.pillar, idx, -1)} className="text-xs text-muted-foreground hover:text-primary">▲</button>
                      <button onClick={() => moveItem(g.pillar, idx, 1)} className="text-xs text-muted-foreground hover:text-primary">▼</button>
                      <button onClick={() => startRename(g.pillar, it)} className="text-xs uppercase tracking-widest text-primary hover:underline">Renomear</button>
                      <button onClick={() => removeItem(g.pillar, it)} className="text-xs uppercase tracking-widest text-destructive hover:underline">Remover</button>
                    </div>

                    {/* Histórico 21 Dias do Hábito */}
                    <div className="mt-2 flex gap-[2px] overflow-x-auto pb-1">
                      {daysArray.map(d => {
                        const s = history[d]?.[it];
                        const isToday = d === date;
                        let bgClass = "bg-border";
                        if (s === 'green') bgClass = "bg-green-500";
                        if (s === 'red') bgClass = "bg-red-500";
                        return (
                          <div
                            key={d}
                            title={`${d.split('-')[2]}/${d.split('-')[1]} - ${s === 'green' ? 'Feito' : s === 'red' ? 'Falhou' : 'Pendente'}`}
                            className={`h-3 min-w-[10px] flex-1 max-w-[12px] rounded-[1px] transition-colors ${
                              isToday ? 'ring-1 ring-primary ring-offset-1 ring-offset-background' : ''
                            } ${bgClass}`}
                          />
                        );
                      })}
                    </div>
                  </li>
                );
              })}
              {g.items.length === 0 && (
                <li className="py-4 text-sm italic text-muted-foreground">Nenhum hábito neste pilar.</li>
              )}
            </ul>
          </div>
        ))}
        <button
          onClick={() => setHistory({})}
          className="text-sm uppercase tracking-widest text-destructive hover:underline"
        >
          Limpar Todo o Histórico
        </button>
      </section>
    </PageShell>
  );
}

