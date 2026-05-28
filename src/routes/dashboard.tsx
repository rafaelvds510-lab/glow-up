import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState, useMemo } from "react";
import { PageShell } from "@/components/PageShell";
import { LaurelDivider, Owl, Roman } from "@/components/Ornaments";
import { useVisitPage } from "@/hooks/useAscensao";
import { loadLeituras, upsertLeitura, ReadingEntry, ReadingStatus } from "@/lib/leituras";
import { loadVicios, addVicio, addRelapse, getDaysClean, getActiveVicios, Vicio, editVicio, removeVicio } from "@/lib/vicios";
import confetti from "canvas-confetti";
import { DashboardCalendar } from "@/components/DashboardCalendar";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "Painel do Santuário — Dashboard | Santuário do Glow-up" },
      { name: "description", content: "Acompanhe suas manutenções críticas, hábitos diários e leituras em um único templo de evolução." },
      { property: "og:title", content: "Painel do Santuário — Dashboard" },
      { property: "og:description", content: "Mapeie o progresso da tua própria escultura de mármore." },
    ],
  }),
  component: Dashboard,
});

type AlertItem = {
  id: string;
  title: string;
  description: string;
  lastDone: string; // YYYY-MM-DD
  frequencyDays: number;
  originKey: string; // Chave do localStorage de origem
};

const defaultGroups = [
  {
    pillar: "Higiene",
    items: [
      "Tomar banho padrão",
      "Usar fio dental todos os dias",
      "Desodorante com a axila limpa e seca",
      "Lavar o rosto de manhã e a noite",
      "Aparar pelos",
      "Esfoliar a pele (retira pele morta)",
    ],
  },
  {
    pillar: "Aura",
    items: [
      "Skincare matinal completo",
      "Proteção solar reaplicada",
      "Treino de força ou mobilidade",
      "Postura: 3 check-ins ao longo do dia",
    ],
  },
  {
    pillar: "Verbo",
    items: [
      "Leitura em voz alta — 10 minutos",
      "Uma conversa significativa (sem ecrã)",
      "Diário de uma frase memorável do dia",
    ],
  }
];

const HABIT_STORAGE_KEY = "santuario.habitos.v1";
const GROUPS_KEY = "santuario.habitos.groups.v1";

function todayKey() {
  return new Date().toISOString().slice(0, 10);
}

function getPastDates(numDays: number) {
  const dates = [];
  for (let i = numDays - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    dates.push(d.toISOString().slice(0, 10));
  }
  return dates;
}

function Dashboard() {
  useVisitPage("dashboard");

  const todayStr = todayKey();

  // Estados dos Hábitos
  const [groups, setGroups] = useState(() => {
    if (typeof window === "undefined") return [];
    try {
      const savedGroups = localStorage.getItem(GROUPS_KEY);
      if (savedGroups) return JSON.parse(savedGroups);
    } catch {}
    return [];
  });
  const [habitHistory, setHabitHistory] = useState<Record<string, Record<string, 'green' | 'red'>>>(() => {
    if (typeof window === "undefined") return {};
    try {
      const raw = localStorage.getItem("santuario.habitos.v1");
      if (raw) {
        const parsed = JSON.parse(raw);
        return parsed.history ?? {};
      }
    } catch {}
    return {};
  });
  const [animateNextHabit, setAnimateNextHabit] = useState(false);

  // Estados das Leituras
  const [readMap, setReadMap] = useState<Record<string, ReadingEntry>>(() => {
    try {
      return loadLeituras();
    } catch {
      return {};
    }
  });

  // Estados dos Alertas
  const [criticalAlerts, setCriticalAlerts] = useState<AlertItem[]>(() => {
    if (typeof window === "undefined") return [];
    try {
      const alerts: AlertItem[] = [];
      const todayStr = new Date().toISOString().slice(0, 10);
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.endsWith(".alert")) {
          const raw = localStorage.getItem(key);
          if (raw) {
            const parsed = JSON.parse(raw);
            if (Array.isArray(parsed)) {
              parsed.forEach((item: any) => {
                alerts.push({
                  ...item,
                  originKey: key
                });
              });
            } else if (parsed.lastDone) {
              alerts.push({
                id: 'legacy',
                title: key.replace("aura.", "").replace(".alert", ""),
                description: '',
                lastDone: parsed.lastDone,
                frequencyDays: parsed.frequencyDays || 30,
                originKey: key
              });
            }
          }
        }
      }

      return alerts.map(item => {
        const lastD = new Date(item.lastDone);
        const today = new Date(todayStr);
        const diffTime = today.getTime() - lastD.getTime();
        const passedDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
        const daysDiff = item.frequencyDays - passedDays;
        return { item, daysDiff };
      })
      .filter(({ daysDiff }) => daysDiff <= 3)
      .sort((a, b) => a.daysDiff - b.daysDiff)
      .map(({ item }) => item);
    } catch {
      return [];
    }
  });

  // Estados de Vícios (Libertação)
  const [vicios, setVicios] = useState<Vicio[]>(() => {
    try {
      return loadVicios();
    } catch {
      return [];
    }
  });

  // Carregar todos os dados ao montar e sincronizar
  const loadAllData = () => {
    // 1. Carregar Hábitos
    try {
      const savedGroups = localStorage.getItem(GROUPS_KEY);
      if (savedGroups) setGroups(JSON.parse(savedGroups));
      
      const rawHabit = localStorage.getItem(HABIT_STORAGE_KEY);
      if (rawHabit) {
        const parsed = JSON.parse(rawHabit);
        setHabitHistory(parsed.history ?? {});
      }
    } catch (e) {
      console.error("Erro ao carregar hábitos no Dashboard", e);
    }

    // 2. Carregar Leituras
    try {
      setReadMap(loadLeituras());
    } catch (e) {
      console.error("Erro ao carregar leituras no Dashboard", e);
    }

    // 3. Carregar Vícios
    try {
      setVicios(loadVicios());
    } catch (e) {
      console.error("Erro ao carregar vícios no Dashboard", e);
    }

    // 3. Carregar e Filtrar Alertas Críticos (<= 3 dias)
    try {
      const alerts: AlertItem[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.endsWith(".alert")) {
          const raw = localStorage.getItem(key);
          if (raw) {
            const parsed = JSON.parse(raw);
            if (Array.isArray(parsed)) {
              parsed.forEach((item: any) => {
                alerts.push({
                  ...item,
                  originKey: key
                });
              });
            } else if (parsed.lastDone) {
              // Legacy format support
              alerts.push({
                id: 'legacy',
                title: key.replace("aura.", "").replace(".alert", ""),
                description: '',
                lastDone: parsed.lastDone,
                frequencyDays: parsed.frequencyDays || 30,
                originKey: key
              });
            }
          }
        }
      }

      // Filtrar apenas manutenções com 3 dias ou menos restantes
      const filtered = alerts.map(item => {
        const lastD = new Date(item.lastDone);
        const today = new Date(todayStr);
        const diffTime = today.getTime() - lastD.getTime();
        const passedDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
        const daysDiff = item.frequencyDays - passedDays;
        return { item, daysDiff };
      })
      .filter(({ daysDiff }) => daysDiff <= 3)
      .sort((a, b) => a.daysDiff - b.daysDiff)
      .map(({ item }) => item);

      setCriticalAlerts(filtered);
    } catch (e) {
      console.error("Erro ao ler alertas no Dashboard", e);
    }
  };

  useEffect(() => {
    loadAllData();

    // Eventos para sincronização
    window.addEventListener("habitos:update", loadAllData);
    window.addEventListener("leituras:update", loadAllData);
    window.addEventListener("vicios:update", loadAllData);
    window.addEventListener("storage", loadAllData);
    return () => {
      window.removeEventListener("habitos:update", loadAllData);
      window.removeEventListener("leituras:update", loadAllData);
      window.removeEventListener("vicios:update", loadAllData);
      window.removeEventListener("storage", loadAllData);
    };
  }, []);

  // 1. Lógica do Próximo Hábito Sequencial
  const allHabits = useMemo(() => groups.flatMap((g) => g.items), [groups]);
  const todayDone = habitHistory[todayStr] || {};

  const nextPendingHabit = useMemo(() => {
    return allHabits.find(item => todayDone[item] !== 'green');
  }, [allHabits, todayDone]);

  // Completar o hábito com animação
  const handleCompleteHabit = (habitName: string) => {
    setAnimateNextHabit(true);
    
    // Pequeno delay para a animação de fade-out
    setTimeout(() => {
      const todayHistory = habitHistory[todayStr] || {};
      const nextToday = { ...todayHistory, [habitName]: 'green' as const };
      const nextHistory = { ...habitHistory, [todayStr]: nextToday };
      
      setHabitHistory(nextHistory);
      localStorage.setItem(HABIT_STORAGE_KEY, JSON.stringify({ history: nextHistory }));
      window.dispatchEvent(new CustomEvent("habitos:update"));
      
      // Se era o último hábito, comemorar!
      const totalPendentes = allHabits.filter(h => h !== habitName && todayDone[h] !== 'green').length;
      if (totalPendentes === 0) {
        confetti({
          particleCount: 150,
          spread: 80,
          origin: { y: 0.6 },
          colors: ["#D4AF37", "#0A2540", "#C85A17", "#F5F5F5"]
        });
      }

      setAnimateNextHabit(false);
    }, 300);
  };

  // 2. Estatísticas e Dados do Gráfico de Hábitos (Últimos 7 dias)
  const last7Days = useMemo(() => getPastDates(7), []);
  const chartData = useMemo(() => {
    return last7Days.map(d => {
      const dayHistory = habitHistory[d] || {};
      const doneCount = allHabits.filter(h => dayHistory[h] === 'green').length;
      const percent = allHabits.length > 0 ? Math.round((doneCount / allHabits.length) * 100) : 0;
      
      // Obter dia da semana em PT-BR
      const dateObj = new Date(d + "T12:00:00");
      const weekday = dateObj.toLocaleDateString("pt-BR", { weekday: "short" }).slice(0, 3).toUpperCase();
      const dayMonth = d.slice(8, 10) + "/" + d.slice(5, 7);

      const relapsesOnDay = vicios.reduce((total, v) => {
        return total + v.relapses.filter(r => r.startsWith(d)).length;
      }, 0);

      return {
        dateStr: d,
        label: weekday,
        dayMonth,
        percent,
        doneCount,
        total: allHabits.length,
        relapses: relapsesOnDay
      };
    });
  }, [last7Days, habitHistory, allHabits, vicios]);

  const completedTodayCount = allHabits.filter(h => todayDone[h] === 'green').length;
  const pctToday = allHabits.length > 0 ? Math.round((completedTodayCount / allHabits.length) * 100) : 0;

  // 3. Lógica das Leituras Ativas
  const activeReadings = useMemo(() => {
    return Object.values(readMap).filter(r => r.status === "lendo");
  }, [readMap]);

  const handleUpdatePage = (bookKeyStr: string, increment: number) => {
    const book = readMap[bookKeyStr];
    if (!book) return;

    const newPage = Math.max(0, Math.min(book.totalPages, book.currentPage + increment));
    upsertLeitura(bookKeyStr, {
      title: book.title,
      author: book.author,
      currentPage: newPage,
      totalPages: book.totalPages,
      status: newPage >= book.totalPages ? "lido" : "lendo"
    });
  };

  const handleFinishBook = (bookKeyStr: string) => {
    const book = readMap[bookKeyStr];
    if (!book) return;

    upsertLeitura(bookKeyStr, {
      title: book.title,
      author: book.author,
      currentPage: book.totalPages,
      totalPages: book.totalPages,
      status: "lido"
    });
  };

  // 4. Registrar Manutenção da Aura de Hoje
  const handleMarkAlertToday = (alert: AlertItem) => {
    try {
      const raw = localStorage.getItem(alert.originKey);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          const updated = parsed.map(i => i.id === alert.id ? { ...i, lastDone: todayStr } : i);
          localStorage.setItem(alert.originKey, JSON.stringify(updated));
        } else {
          // Legacy format
          localStorage.setItem(alert.originKey, JSON.stringify({
            ...parsed,
            lastDone: todayStr
          }));
        }
        
        // Recarregar dados
        loadAllData();
        
        // Pequena celebração
        confetti({
          particleCount: 50,
          spread: 40,
          origin: { y: 0.8 },
          colors: ["#D4AF37", "#0A2540"]
        });
      }
    } catch (e) {
      console.error("Erro ao registrar manutenção do alerta", e);
    }
  };

  // Obter dias restantes de um alerta
  const getDaysLeftText = (alert: AlertItem) => {
    const lastD = new Date(alert.lastDone);
    const today = new Date(todayStr);
    const diffTime = today.getTime() - lastD.getTime();
    const passedDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    const daysDiff = alert.frequencyDays - passedDays;
    
    if (daysDiff < 0) {
      return { text: `Atrasado há ${Math.abs(daysDiff)} dias`, isOverdue: true };
    } else if (daysDiff === 0) {
      return { text: "Expira HOJE!", isOverdue: true };
    } else {
      return { text: `Falta${daysDiff === 1 ? "" : "m"} ${daysDiff} dia${daysDiff === 1 ? "" : "s"}`, isOverdue: false };
    }
  };

  // 5. Handlers de Libertação de Vícios
  const activeVicios = useMemo(() => getActiveVicios(vicios), [vicios]);

  const handleAddVicio = () => {
    const name = prompt("Qual vício você deseja banir da sua vida?");
    if (name && name.trim()) {
      addVicio(name.trim());
    }
  };

  const handleEditVicio = (id: string, oldName: string) => {
    const newName = prompt("Editar nome do vício:", oldName);
    if (newName && newName.trim() && newName.trim() !== oldName) {
      editVicio(id, newName.trim());
    }
  };

  const handleRemoveVicio = (id: string) => {
    if (confirm("Tem certeza que deseja excluir este vício do rastreio?")) {
      removeVicio(id);
    }
  };

  const handleRelapseVicio = (id: string) => {
    if (confirm("Houve uma recaída? A disciplina começa hoje, novamente. Apenas a verdade o liberta.")) {
      addRelapse(id);
    }
  };

  return (
    <PageShell>
      <section className="mx-auto max-w-6xl px-6 pt-16 pb-24">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          
          {/* COLUNA ESQUERDA & CENTRAL: RITUAL E GRÁFICO */}
          <div className="lg:col-span-2 flex flex-col gap-8">
            
            {/* PRÓXIMO HÁBITO SEQUENCIAL */}
            <div className="border border-border bg-card p-8 shadow-sm relative overflow-hidden">
              <div className="absolute top-0 left-0 h-[3px] w-full bg-primary" />
              <div className="flex items-center justify-between">
                <span className="font-display text-xl md:text-2xl text-aegean uppercase tracking-wider font-semibold">Ritual Sequencial</span>
                <Link to="/habitos" className="text-sm font-semibold uppercase tracking-widest text-primary hover:underline">
                  Ver Todos ({allHabits.length})
                </Link>
              </div>

              {nextPendingHabit ? (
                <div className={`mt-8 transition-all duration-300 ${animateNextHabit ? 'opacity-0 scale-95 translate-y-2' : 'opacity-100 scale-100 translate-y-0'}`}>
                  <p className="text-xs md:text-sm uppercase tracking-wider text-terracotta font-semibold">
                    PRÓXIMO RITUAL DE HOJE
                  </p>
                  <h2 className="mt-2 font-display text-4xl md:text-5xl lg:text-6xl text-aegean min-h-[4rem] flex items-center">
                    {nextPendingHabit}
                  </h2>
                  <div className="mt-8 flex flex-col sm:flex-row items-center gap-4">
                    <button
                      onClick={() => handleCompleteHabit(nextPendingHabit)}
                      className="w-full sm:w-auto px-8 py-4 bg-primary text-marble text-sm md:text-base uppercase tracking-widest font-bold hover:bg-primary/95 transition shadow-sm hover:shadow-md flex items-center justify-center gap-2"
                    >
                      <span>✓ Marcar como Feito</span>
                    </button>
                    <p className="text-sm md:text-base text-muted-foreground italic">
                      Restam {allHabits.length - completedTodayCount} hábitos pendentes para hoje.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="mt-8 py-8 text-center">
                  <Owl className="mx-auto h-12 w-12 text-gold opacity-80 mb-4" />
                  <h3 className="font-display text-2xl text-aegean">Templo Erguido!</h3>
                  <p className="mt-2 text-sm text-muted-foreground max-w-sm mx-auto">
                    Todos os rituais e hábitos do dia foram concluídos com honra e disciplina. O mármore resplandece hoje.
                  </p>
                </div>
              )}

              {/* Barra de Progresso do Dia */}
              <div className="mt-8 pt-6 border-t border-border/40">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-muted-foreground">Progresso do Dia</span>
                  <span className="font-bold text-aegean">{pctToday}% ({completedTodayCount}/{allHabits.length})</span>
                </div>
                <div className="h-2 w-full bg-border rounded-full overflow-hidden">
                  <div className="h-full bg-primary transition-all duration-500" style={{ width: `${pctToday}%` }} />
                </div>
              </div>
            </div>

            {/* GRÁFICO DE HÁBITOS (ÚLTIMOS 7 DIAS) */}
            <div className="border border-border bg-card p-8 shadow-sm">
              <div className="flex items-center justify-between mb-8">
                <span className="font-display text-xl md:text-2xl text-aegean uppercase tracking-wider font-semibold">Consistência Semanal</span>
                <span className="text-sm italic text-muted-foreground">Progresso nos últimos 7 dias</span>
              </div>

              {/* GRÁFICO SVG ELEGANTE */}
              <div className="relative w-full h-56 flex flex-col justify-end pt-4 pb-6 px-2">
                {/* Linhas de Grade de Fundo */}
                <div className="absolute inset-0 pb-6 flex flex-col justify-between pointer-events-none z-0">
                  <div className="w-full border-t border-border/40" />
                  <div className="w-full border-t border-border/40" />
                  <div className="w-full border-t border-border/40" />
                  <div className="w-full border-t border-border/40" />
                  <div className="w-full border-t border-border/40" />
                </div>

                {/* Eixo Y Labels */}
                <div className="absolute left-0 top-0 h-[calc(100%-1.5rem)] flex flex-col justify-between text-xs text-muted-foreground font-mono select-none pointer-events-none">
                  <span>100%</span>
                  <span>75%</span>
                  <span>50%</span>
                  <span>25%</span>
                  <span>0%</span>
                </div>

                {/* Área das Barras */}
                <div className="relative flex-1 w-full pl-8 flex justify-between items-end gap-2 md:gap-4 z-10">
                  {chartData.map((d) => {
                    const isToday = d.dateStr === todayStr;
                    return (
                      <div key={d.dateStr} className="flex-1 flex flex-col justify-end items-center h-full group relative">
                        {/* Barra */}
                        <div 
                          className={`w-full rounded-t-sm transition-all duration-500 ${
                            isToday 
                              ? 'bg-gradient-to-t from-primary to-gold shadow-[0_0_12px_rgba(212,175,55,0.2)]' 
                              : 'bg-primary/45 group-hover:bg-primary/70'
                          }`}
                          style={{ height: `${d.percent}%`, minHeight: d.percent > 0 ? '4px' : '0' }}
                        />

                        {/* Label de percentual no topo ao passar o mouse */}
                        <div className="absolute bottom-full mb-2 hidden group-hover:flex flex-col items-center bg-aegean text-marble text-xs px-2 py-1 shadow-md z-20 pointer-events-none rounded-[1px] whitespace-nowrap">
                          <span className="font-bold">{d.percent}% concluído</span>
                          <span className="text-[10px] opacity-85">({d.doneCount}/{d.total} rituais)</span>
                          {d.relapses > 0 && (
                            <span className="text-[10px] text-destructive mt-1 font-bold">
                              Recaídas: {d.relapses}
                            </span>
                          )}
                        </div>

                        {/* Dia da Semana (X-Axis Label) */}
                        <span className={`absolute -bottom-6 text-xs md:text-sm tracking-wider ${isToday ? 'text-primary font-bold' : 'text-muted-foreground'}`}>
                          {d.label}
                        </span>
                        
                        {/* Data pequena abaixo do dia */}
                        <span className="absolute -bottom-9 text-[10px] text-muted-foreground/60 scale-90">
                          {d.dayMonth}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* CALENDÁRIO DE CONSISTÊNCIA MENSAL */}
            <DashboardCalendar habitHistory={habitHistory} allHabits={allHabits} />

          </div>

          {/* COLUNA DIREITA: ALERTAS CRÍTICOS & PROGRESOS DE LEITURA */}
          <div className="flex flex-col gap-8">
            
            {/* ALERTAS CRÍTICOS (MANUTENÇÕES DA AURA) */}
            <div className="border border-border bg-card p-6 shadow-sm flex flex-col">
              <span className="font-display text-xl md:text-2xl text-aegean uppercase tracking-wider font-semibold block mb-4">Manutenções Críticas</span>
              
              {criticalAlerts.length > 0 ? (
                <div className="flex flex-col gap-4">
                  <div className="flex flex-col gap-3">
                    {criticalAlerts.map((alert) => {
                      const countdown = getDaysLeftText(alert);
                      return (
                        <div 
                          key={alert.id} 
                          className={`border p-4 transition-all ${
                            countdown.isOverdue 
                              ? 'border-destructive/30 bg-destructive/5' 
                              : 'border-gold/30 bg-gold/5'
                          }`}
                        >
                          <div className="flex justify-between items-start">
                            <div>
                              <h4 className="font-display text-xl md:text-2xl text-aegean font-bold leading-tight">{alert.title}</h4>
                              {alert.description && <p className="text-sm text-muted-foreground mt-0.5">{alert.description}</p>}
                            </div>
                            <span className={`text-xs font-mono font-semibold uppercase tracking-wider px-2 py-0.5 rounded-[1px] ${
                              countdown.isOverdue ? 'text-destructive bg-destructive/10' : 'text-gold bg-gold/15'
                            }`}>
                              {countdown.isOverdue ? "Crítico" : "Atenção"}
                            </span>
                          </div>

                          <div className="mt-4 flex items-center justify-between">
                            <div className="text-sm text-muted-foreground">
                              <span className="font-semibold text-foreground">{countdown.text}</span>
                              <span className="block text-xs opacity-75">Meta: a cada {alert.frequencyDays} dias</span>
                            </div>

                            <button
                              onClick={() => handleMarkAlertToday(alert)}
                              className="px-4 py-2 border border-primary/40 text-xs md:text-sm uppercase tracking-widest text-primary hover:bg-primary hover:text-marble transition font-bold"
                            >
                              Feito Hoje
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <div className="py-8 text-center border border-dashed border-border flex flex-col items-center justify-center">
                  <span className="text-2xl mb-2">✦</span>
                  <p className="text-sm font-display text-aegean">Templo Impecável</p>
                  <p className="mt-1 text-xs text-muted-foreground max-w-[200px]">
                    Todas as manutenções e cuidados de estética estão em dia.
                  </p>
                </div>
              )}
            </div>

            {/* PROGRESSO DE LEITURA */}
            <div className="border border-border bg-card p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <span className="font-display text-xl md:text-2xl text-aegean uppercase tracking-wider font-semibold">Progresso Literário</span>
                <Link to="/biblioteca" className="text-sm font-semibold uppercase tracking-widest text-primary hover:underline">
                  Biblioteca
                </Link>
              </div>

              {activeReadings.length > 0 ? (
                <div className="flex flex-col gap-5">
                  {activeReadings.map((book) => {
                    const bookKeyStr = `${book.title}::${book.author}`.toLowerCase();
                    const pct = book.totalPages > 0 ? Math.round((book.currentPage / book.totalPages) * 100) : 0;
                    
                    return (
                      <div key={bookKeyStr} className="border-b border-border/40 pb-4 last:border-0 last:pb-0">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <h4 className="font-display text-xl md:text-2xl text-aegean leading-tight font-bold">{book.title}</h4>
                            <p className="text-sm text-muted-foreground italic mt-0.5">{book.author}</p>
                          </div>
                          <span className="font-mono text-base md:text-lg font-bold text-gold">{pct}%</span>
                        </div>

                        {/* Barra de Progresso */}
                        <div className="mt-3 h-1.5 w-full bg-border rounded-full overflow-hidden">
                          <div className="h-full bg-gold transition-all duration-300" style={{ width: `${pct}%` }} />
                        </div>

                        {/* Controles de página rápidos */}
                        <div className="mt-4 flex items-center justify-between">
                          <span className="text-xs md:text-sm font-mono text-muted-foreground">
                            Pág. {book.currentPage} de {book.totalPages}
                          </span>

                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() => handleUpdatePage(bookKeyStr, -5)}
                              disabled={book.currentPage <= 0}
                              className="w-9 h-9 border border-border flex items-center justify-center text-base font-bold text-muted-foreground hover:border-primary hover:text-primary disabled:opacity-30 transition rounded-[1px]"
                              title="Voltar 5 páginas"
                            >
                              -
                            </button>
                            <button
                              onClick={() => handleUpdatePage(bookKeyStr, 5)}
                              disabled={book.currentPage >= book.totalPages}
                              className="w-9 h-9 border border-border flex items-center justify-center text-base font-bold text-muted-foreground hover:border-primary hover:text-primary disabled:opacity-30 transition rounded-[1px]"
                              title="Avançar 5 páginas"
                            >
                              +
                            </button>
                            <button
                              onClick={() => handleFinishBook(bookKeyStr)}
                              className="px-3 h-9 border border-gold text-xs md:text-sm uppercase tracking-wider text-gold hover:bg-gold hover:text-aegean transition font-bold rounded-[1px]"
                              title="Concluir leitura"
                            >
                              Lido
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="py-8 text-center border border-dashed border-border flex flex-col items-center justify-center">
                  <span className="text-2xl mb-2">📖</span>
                  <p className="text-sm font-display text-aegean">Mente Ociosa</p>
                  <p className="mt-1 text-xs text-muted-foreground max-w-[200px] mx-auto">
                    Nenhum livro está sendo lido atualmente. Visite o acervo.
                  </p>
                  <Link 
                    to="/biblioteca"
                    className="mt-4 px-4 py-2 bg-primary/10 border border-primary/20 text-primary text-[10px] uppercase tracking-widest font-bold hover:bg-primary/20 transition"
                  >
                    Escolher Clássico
                  </Link>
                </div>
              )}
            </div>

            {/* LIBERTAÇÃO DE VÍCIOS */}
            <div className="border border-border bg-card p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <span className="font-display text-xl md:text-2xl text-aegean uppercase tracking-wider font-semibold">Libertação</span>
                <button onClick={handleAddVicio} className="text-sm font-semibold uppercase tracking-widest text-primary hover:underline">
                  + Adicionar
                </button>
              </div>

              {activeVicios.length > 0 ? (
                <div className="flex flex-col gap-5">
                  {activeVicios.map((v) => {
                    const daysClean = getDaysClean(v);
                    
                    const todayRelapses = v.relapses
                      .filter(r => r.startsWith(todayStr))
                      .map(r => {
                        const date = new Date(r);
                        return date.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
                      });
                    
                    return (
                      <div key={v.id} className="border-b border-border/40 pb-4 last:border-0 last:pb-0">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="font-display text-xl md:text-2xl text-aegean leading-tight font-bold">{v.name}</h4>
                              <button onClick={() => handleEditVicio(v.id, v.name)} className="text-muted-foreground/40 hover:text-primary transition" title="Editar">
                                ✎
                              </button>
                              <button onClick={() => handleRemoveVicio(v.id)} className="text-muted-foreground/40 hover:text-destructive transition" title="Excluir">
                                ✕
                              </button>
                            </div>
                            <p className="text-sm text-muted-foreground mt-0.5">
                              {v.relapses.length} recaída{v.relapses.length !== 1 && "s"}
                            </p>
                            {todayRelapses.length > 0 && (
                              <p className="text-xs text-destructive font-semibold mt-1">
                                Hoje: {todayRelapses.length} recaída{todayRelapses.length !== 1 && "s"} ({todayRelapses.join(", ")})
                              </p>
                            )}
                          </div>
                          <div className="text-right">
                            <span className="font-mono text-base md:text-lg font-bold text-gold">{daysClean}</span>
                            <span className="block text-xs uppercase tracking-wider text-muted-foreground">Dia{daysClean !== 1 && "s"} Limpo{daysClean !== 1 && "s"}</span>
                          </div>
                        </div>

                        <div className="mt-4 flex justify-end">
                          <button
                            onClick={() => handleRelapseVicio(v.id)}
                            className="px-3 h-9 border border-destructive/40 text-xs md:text-sm uppercase tracking-wider text-destructive hover:bg-destructive hover:text-marble transition font-bold rounded-[1px]"
                            title="Registrar recaída e reiniciar contagem"
                          >
                            Registrar Recaída
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="py-8 text-center border border-dashed border-border flex flex-col items-center justify-center">
                  <span className="text-2xl mb-2">🕊️</span>
                  <p className="text-sm font-display text-aegean">Mente Pura</p>
                  <p className="mt-1 text-xs text-muted-foreground max-w-[200px] mx-auto">
                    Nenhum vício atormenta sua aura, ou já foram vencidos pelo tempo.
                  </p>
                </div>
              )}
            </div>

          </div>

        </div>
      </section>
    </PageShell>
  );
}
