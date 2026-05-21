import { useState, useMemo } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

type DashboardCalendarProps = {
  habitHistory: Record<string, Record<string, 'green' | 'red'>>;
  allHabits: string[];
};

export function DashboardCalendar({ habitHistory, allHabits }: DashboardCalendarProps) {
  const [currentDate, setCurrentDate] = useState(() => new Date());

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  // Obter nome do mês em português
  const monthName = useMemo(() => {
    const formatter = new Intl.DateTimeFormat("pt-BR", { month: "long" });
    const name = formatter.format(currentDate);
    return name.charAt(0).toUpperCase() + name.slice(1);
  }, [currentDate]);

  // Navegar meses
  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  type PaddingDay = { day: number; isCurrentMonth: false; dateStr: "" };
  type CurrentDay = {
    day: number;
    isCurrentMonth: true;
    dateStr: string;
    isFuture: boolean;
    isToday: boolean;
    percent: number;
    doneCount: number;
    totalCount: number;
  };
  type CalendarDay = PaddingDay | CurrentDay;

  // Obter dias do mês atual e preenchimento
  const calendarDays = useMemo(() => {
    const firstDayIndex = new Date(year, month, 1).getDay();
    const totalDays = new Date(year, month + 1, 0).getDate();
    
    const prevMonthTotalDays = new Date(year, month, 0).getDate();
    
    const days: CalendarDay[] = [];
    
    // Dias do mês anterior para preenchimento (padding)
    for (let i = firstDayIndex - 1; i >= 0; i--) {
      days.push({
        day: prevMonthTotalDays - i,
        isCurrentMonth: false,
        dateStr: "",
      });
    }

    // Dias do mês atual
    const today = new Date();
    const todayStr = today.toISOString().slice(0, 10);
    
    for (let d = 1; d <= totalDays; d++) {
      const dateObj = new Date(year, month, d);
      const yyyy = dateObj.getFullYear();
      const mm = String(dateObj.getMonth() + 1).padStart(2, "0");
      const dd = String(dateObj.getDate()).padStart(2, "0");
      const dateStr = `${yyyy}-${mm}-${dd}`;
      
      const isFuture = dateStr > todayStr;
      const isToday = dateStr === todayStr;

      const dayHistory = habitHistory[dateStr] || {};
      const doneCount = allHabits.filter(h => dayHistory[h] === 'green').length;
      const percent = allHabits.length > 0 ? doneCount / allHabits.length : 0;

      days.push({
        day: d,
        isCurrentMonth: true,
        dateStr,
        isFuture,
        isToday,
        percent,
        doneCount,
        totalCount: allHabits.length,
      });
    }

    // Preencher o final da grade até completar múltiplos de 7
    const remainingCells = 42 - days.length;
    for (let i = 1; i <= remainingCells; i++) {
      days.push({
        day: i,
        isCurrentMonth: false,
        dateStr: "",
      });
    }

    return days;
  }, [year, month, habitHistory, allHabits]);

  // Dias da semana
  const weekdays = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

  // Obter classe CSS ou estilo inline com base na porcentagem de conclusão
  const getDayStyles = (dayInfo: CalendarDay) => {
    if (!dayInfo.isCurrentMonth) {
      return "text-muted-foreground/35 bg-background/5 border border-border/10 cursor-not-allowed";
    }
    if (dayInfo.isFuture) {
      return "text-foreground/50 border border-border/30 bg-background/20 cursor-default";
    }

    // Para dias atuais ou passados
    const { percent, isToday } = dayInfo;

    const baseClass = "relative flex flex-col items-center justify-center font-display text-lg md:text-xl transition-all duration-300 group cursor-pointer border";

    if (isToday) {
      if (percent === 1) {
        return `${baseClass} bg-gold text-aegean font-bold border-gold shadow-[0_0_15px_rgba(212,175,55,0.45)] scale-102 z-10`;
      }
      if (percent > 0) {
        return `${baseClass} bg-gold/25 text-aegean font-bold border-gold shadow-[0_0_8px_rgba(212,175,55,0.2)]`;
      }
      return `${baseClass} border-gold text-foreground/90 font-bold bg-background/30`;
    }

    // Passados
    if (percent === 1) {
      // 100% concluído
      return `${baseClass} bg-gold/90 hover:bg-gold text-aegean font-semibold border-gold/80 hover:border-gold hover:shadow-[0_0_12px_rgba(212,175,55,0.3)]`;
    }
    if (percent >= 0.75) {
      return `${baseClass} bg-gold/60 hover:bg-gold/70 text-aegean/90 hover:text-aegean border-gold/50`;
    }
    if (percent >= 0.5) {
      return `${baseClass} bg-gold/40 hover:bg-gold/50 text-foreground border-gold/30`;
    }
    if (percent >= 0.25) {
      return `${baseClass} bg-gold/20 hover:bg-gold/30 text-foreground/90 border-gold/20`;
    }
    if (percent > 0) {
      return `${baseClass} bg-gold/10 hover:bg-gold/20 text-foreground/80 border-gold/10`;
    }
    // 0% concluído
    return `${baseClass} border-border/40 hover:border-border/80 text-foreground/75 bg-muted/20`;
  };

  return (
    <div className="border border-border bg-card p-6 md:p-8 shadow-sm flex flex-col">
      {/* HEADER DO CALENDÁRIO */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <span className="font-display text-xl md:text-2xl text-aegean uppercase tracking-wider font-semibold block">
            Calendário de Consistência
          </span>
          <span className="text-xs text-muted-foreground italic mt-0.5">
            Registro visual da sua disciplina diária
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handlePrevMonth}
            className="w-9 h-9 border border-border flex items-center justify-center text-muted-foreground hover:border-primary hover:text-primary transition rounded-[1px]"
            title="Mês Anterior"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <span className="font-display text-lg md:text-xl text-aegean font-bold min-w-[110px] text-center select-none">
            {monthName} {year}
          </span>
          <button
            onClick={handleNextMonth}
            className="w-9 h-9 border border-border flex items-center justify-center text-muted-foreground hover:border-primary hover:text-primary transition rounded-[1px]"
            title="Próximo Mês"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* DIAS DA SEMANA */}
      <div className="grid grid-cols-7 gap-1 text-center mb-2">
        {weekdays.map((day) => (
          <span key={day} className="label-eyebrow !text-[0.9rem] py-1 text-muted-foreground/80 font-semibold select-none">
            {day}
          </span>
        ))}
      </div>

      {/* GRADE DE DIAS */}
      <div className="grid grid-cols-7 gap-1 flex-1">
        {calendarDays.map((dayInfo, idx) => (
          <div
            key={idx}
            className={`${getDayStyles(dayInfo)} aspect-square`}
          >
            <span>{dayInfo.day}</span>

            {/* TOOLTIP ON HOVER */}
            {dayInfo.isCurrentMonth && !dayInfo.isFuture && (
              <div className="absolute bottom-full mb-2 hidden group-hover:flex flex-col items-center bg-aegean text-marble text-[10px] md:text-xs p-2.5 shadow-md z-20 pointer-events-none rounded-[1px] whitespace-nowrap leading-tight">
                <span className="font-semibold text-gold">
                  {dayInfo.day} de {monthName}
                </span>
                <span className="mt-1 font-bold">
                  {Math.round((dayInfo.percent ?? 0) * 100)}% concluído
                </span>
                <span className="opacity-80 text-[9px] md:text-[10px]">
                  ({dayInfo.doneCount} de {dayInfo.totalCount} hábitos)
                </span>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* LEGENDA */}
      <div className="mt-6 pt-5 border-t border-border/40 flex flex-wrap gap-4 text-xs justify-center md:justify-start">
        <div className="flex items-center gap-2">
          <span className="w-3.5 h-3.5 border border-border/40 bg-muted/20 inline-block" />
          <span className="text-muted-foreground">Sem rituais</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3.5 h-3.5 border border-gold/20 bg-gold/20 inline-block" />
          <span className="text-muted-foreground">Consistência Parcial</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3.5 h-3.5 border border-gold bg-gold inline-block shadow-[0_0_8px_rgba(212,175,55,0.3)]" />
          <span className="text-muted-foreground font-semibold text-aegean">100% Concluído</span>
        </div>
      </div>
    </div>
  );
}
