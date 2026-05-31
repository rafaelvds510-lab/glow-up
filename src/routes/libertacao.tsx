import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState, useMemo } from "react";
import { PageShell, PageHero } from "@/components/PageShell";
import { useVisitPage } from "@/hooks/useAscensao";
import { loadVicios, addVicio, addRelapse, removeVicio, editVicio, getDaysClean, Vicio } from "@/lib/vicios";

export const Route = createFileRoute("/libertacao")({
  head: () => ({
    meta: [
      { title: "Libertação — Purificação da Aura | Santuário do Glow-up" },
      { name: "description", content: "Acompanhamento mensal de recaídas para banir vícios e purificar sua mente." },
      { property: "og:title", content: "Libertação — Purificação da Aura" },
      { property: "og:description", content: "A força de um homem mede-se pelas correntes das quais se liberta." },
    ],
  }),
  component: Libertacao,
});

function Libertacao() {
  useVisitPage("libertacao");

  const [vicios, setVicios] = useState<Vicio[]>([]);
  const [newVicioName, setNewVicioName] = useState("");
  const [currentDate, setCurrentDate] = useState(() => new Date());

  // Carregar vícios e escutar atualizações
  const reloadData = () => {
    try {
      setVicios(loadVicios());
    } catch {}
  };

  useEffect(() => {
    reloadData();
    window.addEventListener("vicios:update", reloadData);
    window.addEventListener("storage", reloadData);
    return () => {
      window.removeEventListener("vicios:update", reloadData);
      window.removeEventListener("storage", reloadData);
    };
  }, []);

  const handleAddVicio = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newVicioName.trim()) return;
    addVicio(newVicioName.trim());
    setNewVicioName("");
  };

  const handleRegisterRelapse = (id: string) => {
    if (confirm("Houve uma recaída? A verdade é o primeiro passo para a libertação. O contador será reiniciado.")) {
      addRelapse(id);
    }
  };

  const handleRemoveVicio = (id: string) => {
    if (confirm("Deseja realmente remover este vício do acompanhamento? Todo o histórico de recaídas dele será excluído.")) {
      removeVicio(id);
    }
  };

  // Lógica de Calendário Mensal
  const selectedYear = currentDate.getFullYear();
  const selectedMonth = currentDate.getMonth();

  const handlePrevMonth = () => {
    setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  const monthName = currentDate.toLocaleDateString("pt-BR", { month: "long", year: "numeric" });

  const daysInMonth = useMemo(() => {
    return new Date(selectedYear, selectedMonth + 1, 0).getDate();
  }, [selectedYear, selectedMonth]);

  const firstDayIndex = useMemo(() => {
    return new Date(selectedYear, selectedMonth, 1).getDay();
  }, [selectedYear, selectedMonth]);

  // Dias da grade do calendário (células)
  const calendarCells = useMemo(() => {
    const cells = [];
    // Espaços vazios no início (dias do mês anterior)
    for (let i = 0; i < firstDayIndex; i++) {
      cells.push({ day: null, dateStr: null });
    }
    // Dias do mês atual
    for (let d = 1; d <= daysInMonth; d++) {
      const monthStr = String(selectedMonth + 1).padStart(2, "0");
      const dayStr = String(d).padStart(2, "0");
      const dateStr = `${selectedYear}-${monthStr}-${dayStr}`;
      cells.push({ day: d, dateStr });
    }
    return cells;
  }, [selectedYear, selectedMonth, daysInMonth, firstDayIndex]);

  // Agrupa recaídas por dia
  const relapsesByDay = useMemo(() => {
    const map: Record<string, Array<{ vicioName: string; time: string }>> = {};
    vicios.forEach(v => {
      v.relapses.forEach(r => {
        const datePart = r.slice(0, 10);
        if (!map[datePart]) map[datePart] = [];
        const time = new Date(r).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
        map[datePart].push({ vicioName: v.name, time });
      });
    });
    return map;
  }, [vicios]);

  // Estatísticas do Mês selecionado
  const monthlyMetrics = useMemo(() => {
    let totalRelapses = 0;
    let daysWithRelapses = 0;
    const relapsesPerVicio: Record<string, number> = {};

    for (let d = 1; d <= daysInMonth; d++) {
      const monthStr = String(selectedMonth + 1).padStart(2, "0");
      const dayStr = String(d).padStart(2, "0");
      const dateStr = `${selectedYear}-${monthStr}-${dayStr}`;

      const relapsesOnDay = relapsesByDay[dateStr] || [];
      if (relapsesOnDay.length > 0) {
        totalRelapses += relapsesOnDay.length;
        daysWithRelapses++;
        relapsesOnDay.forEach(r => {
          relapsesPerVicio[r.vicioName] = (relapsesPerVicio[r.vicioName] || 0) + 1;
        });
      }
    }

    const cleanDays = daysInMonth - daysWithRelapses;
    const purityRate = daysInMonth > 0 ? Math.round((cleanDays / daysInMonth) * 100) : 100;

    let mostCriticalVicio = "Nenhum";
    let maxRelapses = 0;
    Object.entries(relapsesPerVicio).forEach(([name, count]) => {
      if (count > maxRelapses) {
        maxRelapses = count;
        mostCriticalVicio = name;
      }
    });

    return {
      totalRelapses,
      cleanDays,
      purityRate,
      mostCriticalVicio,
      maxRelapses
    };
  }, [vicios, selectedYear, selectedMonth, daysInMonth, relapsesByDay]);

  return (
    <PageShell>
      <PageHero
        eyebrow="Libertação & Purificação"
        title="O Templo da Sobriedade"
        intro="A força de um homem não é medida apenas por aquilo que ele constrói, mas pelas correntes das quais ele escolhe se libertar."
      />

      <div className="mx-auto max-w-5xl px-6 py-12 space-y-12">
        
        {/* SEÇÃO 1: MÁTRICAS MENSAIS */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="border border-border bg-card p-6 flex flex-col justify-between">
            <span className="label-eyebrow">Taxa de Pureza</span>
            <div className="mt-4">
              <span className="font-display text-4xl text-primary">{monthlyMetrics.purityRate}%</span>
              <p className="text-xs text-muted-foreground mt-1">Percentual de dias limpos em {monthName}</p>
            </div>
            <div className="mt-4 h-1.5 w-full bg-border rounded-full overflow-hidden">
              <div className="h-full bg-primary transition-all" style={{ width: `${monthlyMetrics.purityRate}%` }} />
            </div>
          </div>

          <div className="border border-border bg-card p-6 flex flex-col justify-between">
            <span className="label-eyebrow">Dias de Vitória</span>
            <div className="mt-4">
              <span className="font-display text-4xl text-green-500">{monthlyMetrics.cleanDays} / {daysInMonth}</span>
              <p className="text-xs text-muted-foreground mt-1">Dias do mês sem nenhuma recaída registrada</p>
            </div>
          </div>

          <div className="border border-border bg-card p-6 flex flex-col justify-between">
            <span className="label-eyebrow">Ponto Crítico</span>
            <div className="mt-4">
              <span className="font-display text-2xl text-terracotta truncate block" title={monthlyMetrics.mostCriticalVicio}>
                {monthlyMetrics.mostCriticalVicio}
              </span>
              <p className="text-xs text-muted-foreground mt-1">
                {monthlyMetrics.maxRelapses > 0 
                  ? `Registrou ${monthlyMetrics.maxRelapses} recaída(s) neste mês` 
                  : "Nenhuma recaída registrada"}
              </p>
            </div>
          </div>
        </section>

        {/* SEÇÃO 2: CALENDÁRIO MENSAL DE RECAÍDAS */}
        <section className="border border-border bg-card p-6 shadow-sm">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6 border-b border-border/40 pb-4">
            <div>
              <h3 className="font-display text-2xl text-aegean uppercase tracking-wider font-semibold">Registro de Recaídas</h3>
              <p className="text-xs text-muted-foreground">Histórico mensal detalhado de sobriedade</p>
            </div>

            {/* Controles de navegação de mês */}
            <div className="flex items-center gap-4 border border-border bg-background px-3 py-1.5">
              <button 
                onClick={handlePrevMonth}
                className="text-muted-foreground hover:text-primary transition font-bold px-2 py-0.5"
                title="Mês anterior"
              >
                ◀
              </button>
              <span className="text-sm font-semibold capitalize font-display min-w-[120px] text-center text-foreground">
                {monthName}
              </span>
              <button 
                onClick={handleNextMonth}
                className="text-muted-foreground hover:text-primary transition font-bold px-2 py-0.5"
                title="Próximo mês"
              >
                ▶
              </button>
            </div>
          </div>

          {/* Grid de dias da semana */}
          <div className="grid grid-cols-7 gap-1 text-center mb-2">
            {["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"].map(day => (
              <span key={day} className="text-[10px] md:text-xs uppercase tracking-widest text-muted-foreground font-semibold py-1">
                {day}
              </span>
            ))}
          </div>

          {/* Grid do Calendário */}
          <div className="grid grid-cols-7 gap-1 border-t border-border/20 pt-1">
            {calendarCells.map((cell, idx) => {
              const hasDay = cell.day !== null;
              const relapses = cell.dateStr ? relapsesByDay[cell.dateStr] || [] : [];
              const hasRelapse = relapses.length > 0;
              const isToday = cell.dateStr === new Date().toISOString().slice(0, 10);

              let cellBg = "bg-background/25 border-border/20";
              if (hasDay) {
                if (hasRelapse) {
                  cellBg = "bg-destructive/10 border-destructive/40 text-destructive";
                } else {
                  cellBg = "bg-green-500/5 border-green-500/20 text-foreground";
                }
              }

              return (
                <div 
                  key={idx}
                  className={`min-h-[60px] md:min-h-[80px] p-1.5 border flex flex-col justify-between group relative transition-colors ${cellBg} ${isToday ? "ring-2 ring-primary ring-offset-2 ring-offset-background" : ""}`}
                >
                  {hasDay ? (
                    <>
                      <div className="flex justify-between items-start">
                        <span className={`text-xs font-mono font-bold ${isToday ? "text-primary bg-primary/10 px-1 rounded-[2px]" : "text-muted-foreground/80"}`}>
                          {cell.day}
                        </span>
                        
                        {/* Indicador visual de status */}
                        {hasRelapse ? (
                          <span className="w-2.5 h-2.5 rounded-full bg-red-600 animate-pulse" title={`${relapses.length} recaída(s)`} />
                        ) : (
                          <span className="w-1.5 h-1.5 rounded-full bg-green-500 opacity-60" title="Dia de vitória" />
                        )}
                      </div>

                      {/* Lista de vícios com recaída no dia (se houver) */}
                      {hasRelapse && (
                        <div className="hidden md:flex flex-col gap-0.5 mt-1 max-h-[45px] overflow-y-auto">
                          {relapses.map((r, i) => (
                            <span 
                              key={i} 
                              className="text-[9px] bg-destructive/15 text-destructive rounded-[2px] px-1 py-0.5 truncate leading-none"
                              title={`${r.vicioName} às ${r.time}`}
                            >
                              {r.vicioName}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Tooltip mobile/desktop ao passar o mouse */}
                      {hasRelapse && (
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block bg-popover text-popover-foreground border border-border shadow-md rounded-[1px] p-2 text-xs z-20 min-w-[150px] pointer-events-none">
                          <p className="font-semibold text-center border-b border-border/40 pb-1 mb-1">Recaídas ({relapses.length})</p>
                          {relapses.map((r, i) => (
                            <p key={i} className="text-[10px] leading-relaxed text-muted-foreground">
                              • <span className="font-bold text-foreground">{r.vicioName}</span> às {r.time}
                            </p>
                          ))}
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="h-full w-full bg-muted/10 opacity-30" />
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {/* SEÇÃO 3: RASTREIO E AÇÕES POR VÍCIO */}
        <section className="border border-border bg-card p-6 shadow-sm">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 border-b border-border/40 pb-4">
            <div>
              <h3 className="font-display text-2xl text-aegean uppercase tracking-wider font-semibold">Seus Compromissos</h3>
              <p className="text-xs text-muted-foreground">Lista de hábitos destrutivos que você está banindo</p>
            </div>

            {/* Form de adicionar vício */}
            <form onSubmit={handleAddVicio} className="flex gap-2 w-full md:w-auto">
              <input 
                type="text" 
                value={newVicioName}
                onChange={e => setNewVicioName(e.target.value)}
                placeholder="Nome do vício..."
                className="flex-1 md:w-60 border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary transition"
              />
              <button 
                type="submit"
                className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold px-4 py-2 text-xs uppercase tracking-widest transition cursor-pointer"
              >
                Banir
              </button>
            </form>
          </div>

          {vicios.length > 0 ? (
            <div className="divide-y divide-border/60">
              {vicios.map(v => {
                const daysClean = getDaysClean(v);
                return (
                  <div key={v.id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 group">
                    <div>
                      <h4 className="font-display text-xl text-aegean font-bold leading-tight">{v.name}</h4>
                    </div>

                    <div className="flex items-center gap-6 justify-between sm:justify-end">
                      <div className="flex items-center gap-4 text-center">
                        <div>
                          <span className="font-mono text-xl font-bold text-gold block">{daysClean}</span>
                          <span className="block text-[10px] uppercase tracking-wider text-muted-foreground">Dias Limpos</span>
                        </div>
                        <div className="border-l border-border/40 pl-4">
                          <span className="font-mono text-xl font-bold text-terracotta block">{v.relapses.length}</span>
                          <span className="block text-[10px] uppercase tracking-wider text-muted-foreground">Recaídas</span>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <button
                          onClick={() => handleRegisterRelapse(v.id)}
                          className="px-3 py-2 border border-destructive/40 hover:bg-destructive hover:text-white text-destructive text-xs uppercase tracking-widest font-semibold transition cursor-pointer"
                          title="Registrar recaída agora"
                        >
                          Recaí
                        </button>
                        <button
                          onClick={() => handleRemoveVicio(v.id)}
                          className="px-2.5 py-2 border border-border hover:bg-muted text-muted-foreground text-xs font-bold transition cursor-pointer"
                          title="Excluir do rastreio"
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="py-12 text-center border border-dashed border-border/65">
              <span className="text-3xl block mb-2">🕊️</span>
              <h4 className="font-display text-lg text-aegean font-semibold">Tua Alma Está Pura</h4>
              <p className="text-xs text-muted-foreground max-w-xs mx-auto mt-1">Você não possui nenhum vício registrado para rastreamento. Adicione um vício no campo acima para iniciar a purificação.</p>
            </div>
          )}
        </section>

      </div>
    </PageShell>
  );
}
