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
    pillar: "Hábitos",
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
    const fallback = [{ pillar: "Hábitos", items: [] }];
    if (typeof window === "undefined") return fallback;
    try {
      const savedGroups = localStorage.getItem(GROUPS_KEY);
      if (savedGroups) {
        const parsed = JSON.parse(savedGroups);
        if (Array.isArray(parsed) && parsed.length > 0) {
          // Migração de múltiplos pilares legados para um único pilar "Hábitos"
          if (parsed.length > 1 || parsed[0].pillar !== "Hábitos") {
            const allItems = parsed.flatMap((g: any) => g.items || []);
            const uniqueItems = Array.from(new Set(allItems));
            const unified = [{ pillar: "Hábitos", items: uniqueItems }];
            localStorage.setItem(GROUPS_KEY, JSON.stringify(unified));
            return unified;
          }
          return parsed;
        }
      }
    } catch {}
    return fallback;
  });
  const [history, setHistory] = useState<Record<string, Record<string, 'green' | 'red'>>>(() => {
    if (typeof window === "undefined") return {};
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
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

  /** Salva explicitamente no localStorage — só chamado em ações do usuário */
  const saveLocally = (
    nextHistory: Record<string, Record<string, 'green' | 'red'>>,
    nextGroups: Array<{ pillar: string; items: string[] }>
  ) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ history: nextHistory }));
      localStorage.setItem(GROUPS_KEY, JSON.stringify(nextGroups));
    } catch (e) {
      console.error("[Habitos] Erro ao salvar no localStorage:", e);
    }
  };

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
    setDate(todayKey());
  }, []);

  // Listener: atualiza UI quando a nuvem envia novos dados (pull)
  useEffect(() => {
    const onCloudUpdate = () => {
      try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw) {
          const parsed = JSON.parse(raw);
          setHistory(parsed.history ?? {});
        }
        const savedGroups = localStorage.getItem(GROUPS_KEY);
        if (savedGroups) {
          const parsed = JSON.parse(savedGroups);
          if (Array.isArray(parsed)) setGroups(parsed);
        }
      } catch {}
    };
    window.addEventListener("habitos:update", onCloudUpdate);
    return () => window.removeEventListener("habitos:update", onCloudUpdate);
  }, []);

  const setHabitState = (k: string, state: 'green' | 'red') => {
    setHistory((prev) => {
      const todayHistory = prev[date] || {};
      const newState = todayHistory[k] === state ? undefined : state;
      const nextToday = { ...todayHistory };
      if (newState) nextToday[k] = newState;
      else delete nextToday[k];
      const next = { ...prev, [date]: nextToday };
      // Salva imediatamente
      saveLocally(next, groups);
      return next;
    });
  };

  const addItem = () => {
    if (!newItemText.trim()) return;
    const trimmed = newItemText.trim();
    const nextGroups = groups.map(g => {
      if (g.pillar === "Hábitos" && !g.items.includes(trimmed)) {
        return { ...g, items: [...g.items, trimmed] };
      }
      return g;
    });
    const finalGroups = nextGroups.length > 0 ? nextGroups : [{ pillar: "Hábitos", items: [trimmed] }];
    setGroups(finalGroups);
    saveLocally(history, finalGroups);
    window.dispatchEvent(new CustomEvent("habitos:update"));
    setNewItemText("");
  };

  const removeItem = (item: string) => {
    const nextGroups = groups.map(g => {
      if (g.pillar === "Hábitos") return { ...g, items: g.items.filter(i => i !== item) };
      return g;
    });
    setGroups(nextGroups);
    saveLocally(history, nextGroups);
    window.dispatchEvent(new CustomEvent("habitos:update"));
  };

  const startRename = (item: string) => {
    setRenamingItem({ pillar: "Hábitos", item });
    setRenameText(item);
  };

  const confirmRename = () => {
    if (!renamingItem) return;
    const newName = renameText.trim();
    if (!newName || newName === renamingItem.item) { setRenamingItem(null); return; }

    const nextGroups = groups.map(g => {
      if (g.pillar !== "Hábitos") return g;
      return { ...g, items: g.items.map(i => i === renamingItem.item ? newName : i) };
    });

    const nextHistory: typeof history = {};
    for (const [day, dayMap] of Object.entries(history)) {
      const newDay: Record<string, 'green' | 'red'> = { ...dayMap };
      if (renamingItem.item in newDay) {
        newDay[newName] = newDay[renamingItem.item];
        delete newDay[renamingItem.item];
      }
      nextHistory[day] = newDay;
    }

    setGroups(nextGroups);
    setHistory(nextHistory);
    saveLocally(nextHistory, nextGroups);
    window.dispatchEvent(new CustomEvent("habitos:update"));
    setRenamingItem(null);
  };

  const moveItem = (index: number, dir: -1 | 1) => {
    const nextGroups = groups.map(g => {
      if (g.pillar !== "Hábitos") return g;
      if (index + dir < 0 || index + dir >= g.items.length) return g;
      const newItems = [...g.items];
      [newItems[index], newItems[index + dir]] = [newItems[index + dir], newItems[index]];
      return { ...g, items: newItems };
    });
    setGroups(nextGroups);
    saveLocally(history, nextGroups);
    window.dispatchEvent(new CustomEvent("habitos:update"));
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

        {/* Campo de Adição de Hábito - Sempre Visível */}
        <div className="mb-6 bg-card border border-border p-5">
          <p className="label-eyebrow mb-3">Novo Hábito</p>
          <div className="flex gap-2">
            <input 
              type="text" 
              value={newItemText} 
              onChange={(e) => setNewItemText(e.target.value)} 
              placeholder="Digite um hábito (ex: Beber 2L de água, Fazer alongamento...) e pressione Enter" 
              className="flex-1 border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-primary transition"
              onKeyDown={(e) => e.key === 'Enter' && addItem()}
            />
            <button 
              onClick={addItem}
              className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold px-6 py-2.5 text-xs uppercase tracking-widest transition cursor-pointer"
            >
              Adicionar
            </button>
          </div>
        </div>

        {groups.map((g) => (
          <div key={g.pillar} className="mb-8">
            <ul className="divide-y divide-border border border-border bg-card">
              {g.items.map((it, idx) => {
                const state = todayDone[it];
                return (
                  <li key={it} className="group py-4 px-4 transition hover:bg-muted/30">
                    <div className="flex items-center gap-3 min-w-0">
                      {/* Setas de Reordenação no Lado Esquerdo */}
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          disabled={idx === 0}
                          onClick={() => moveItem(idx, -1)}
                          className="w-7 h-7 flex items-center justify-center border border-border text-xs text-muted-foreground hover:border-primary hover:text-primary disabled:opacity-30 disabled:hover:border-border disabled:hover:text-muted-foreground transition cursor-pointer disabled:cursor-not-allowed"
                          title="Subir hábito"
                        >
                          ▲
                        </button>
                        <button
                          disabled={idx === g.items.length - 1}
                          onClick={() => moveItem(idx, 1)}
                          className="w-7 h-7 flex items-center justify-center border border-border text-xs text-muted-foreground hover:border-primary hover:text-primary disabled:opacity-30 disabled:hover:border-border disabled:hover:text-muted-foreground transition cursor-pointer disabled:cursor-not-allowed"
                          title="Descer hábito"
                        >
                          ▼
                        </button>
                      </div>

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
                          <button onClick={confirmRename} className="shrink-0 text-xs uppercase tracking-widest text-primary border border-primary px-3 py-1.5 hover:bg-primary/10 transition">OK</button>
                          <button onClick={() => setRenamingItem(null)} className="shrink-0 text-xs text-muted-foreground hover:text-foreground">✕</button>
                        </div>
                      ) : (
                        <span className={`flex-1 min-w-0 text-sm md:text-base font-medium leading-snug ${
                          state === 'green' ? 'text-muted-foreground line-through' : 'text-foreground'
                        }`}>
                          {it}
                        </span>
                      )}

                      {/* Ações de Edição (Desktop: Hover, Mobile: Always visible) */}
                      <div className="opacity-0 group-hover:opacity-100 focus-within:opacity-100 hidden md:flex items-center gap-2 transition-opacity shrink-0">
                        <button onClick={() => startRename(it)} className="text-xs uppercase tracking-widest text-primary hover:underline">Renomear</button>
                        <button onClick={() => removeItem(it)} className="text-xs uppercase tracking-widest text-destructive hover:underline">Remover</button>
                      </div>

                      {/* Botões de check */}
                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          onClick={() => setHabitState(it, 'green')}
                          className={`w-9 h-9 flex items-center justify-center rounded-full border text-xs font-bold transition-colors ${
                            state === 'green'
                              ? 'bg-green-600 border-green-600 text-white'
                              : 'border-border text-muted-foreground hover:border-green-600 hover:text-green-600'
                          }`}
                          title="Feito"
                        >✓</button>
                        <button
                          onClick={() => setHabitState(it, 'red')}
                          className={`w-9 h-9 flex items-center justify-center rounded-full border text-xs font-bold transition-colors ${
                            state === 'red'
                              ? 'bg-red-600 border-red-600 text-white'
                              : 'border-border text-muted-foreground hover:border-red-600 hover:text-red-600'
                          }`}
                          title="Falhou"
                        >✕</button>
                      </div>
                    </div>

                    {/* Ações de edição — mobile */}
                    <div className="mt-2 flex items-center gap-4 md:hidden">
                      <button onClick={() => startRename(it)} className="text-xs uppercase tracking-widest text-primary hover:underline">Renomear</button>
                      <button onClick={() => removeItem(it)} className="text-xs uppercase tracking-widest text-destructive hover:underline">Remover</button>
                    </div>

                    {/* Histórico 21 Dias do Hábito */}
                    <div className="mt-3 flex gap-[2px] overflow-x-auto pb-1">
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
                <li className="py-6 px-4 text-center text-sm italic text-muted-foreground">Você ainda não tem nenhum hábito cadastrado. Adicione um acima para começar!</li>
              )}
            </ul>
          </div>
        ))}
        <div className="mt-8 flex justify-end">
          <button
            onClick={() => {
              if (confirm("Deseja realmente limpar todo o histórico de hábitos? Esta ação não pode ser desfeita.")) {
                setHistory({});
              }
            }}
            className="text-sm uppercase tracking-widest text-destructive hover:underline"
          >
            Limpar Todo o Histórico
          </button>
        </div>
      </section>
    </PageShell>
  );
}

