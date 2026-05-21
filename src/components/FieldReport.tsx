import { useEffect, useState } from "react";
import confetti from "canvas-confetti";
import { loadState, toggleMission } from "@/lib/ascensao";

function goldConfetti() {
  const gold = ["#d4a64a", "#e8c069", "#f0d78c", "#b8862c"];
  const burst = (origin: { x: number; y: number }) =>
    confetti({ particleCount: 80, spread: 70, startVelocity: 45, origin, colors: gold, scalar: 1.1, ticks: 220 });
  burst({ x: 0.2, y: 0.7 });
  burst({ x: 0.8, y: 0.7 });
  setTimeout(() => burst({ x: 0.5, y: 0.6 }), 180);
}

export function FieldReport({
  id,
  title,
  brief,
  steps,
}: {
  id: string;
  title: string;
  brief: string;
  steps?: string[];
}) {
  const [done, setDone] = useState(false);
  const [note, setNote] = useState("");

  useEffect(() => {
    const s = loadState();
    setDone(s.missionsDone.includes(id));
    try {
      const n = localStorage.getItem(`santuario.fieldnote.${id}`);
      if (n) setNote(n);
    } catch {}
  }, [id]);

  useEffect(() => {
    try {
      localStorage.setItem(`santuario.fieldnote.${id}`, note);
    } catch {}
  }, [id, note]);

  const handleToggle = () => {
    const nowDone = toggleMission(id);
    setDone(nowDone);
    if (nowDone) goldConfetti();
  };

  return (
    <section className="mx-auto max-w-3xl px-6 pb-16">
      <div className="relative border border-gold/40 bg-card p-8 shadow-[0_0_30px_-12px_color-mix(in_oklab,var(--gold)_50%,transparent)]">
        <div className="flex items-center justify-between">
          <p className="label-eyebrow">Field Report · Missão</p>
        </div>
        <h3 className="mt-3 font-display text-3xl text-aegean">{title}</h3>
        <p className="mt-3 italic text-foreground/80">{brief}</p>
        {steps && steps.length > 0 && (
          <ul className="mt-5 space-y-2 text-sm text-foreground/85">
            {steps.map((s, i) => (
              <li key={i} className="flex gap-3">
                <span className="font-display text-gold">{String(i + 1).padStart(2, "0")}</span>
                <span>{s}</span>
              </li>
            ))}
          </ul>
        )}
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Regista a tua experiência de campo — o que sentiste, o que aprendeste."
          className="mt-6 min-h-[120px] w-full resize-y border border-border bg-background/60 p-4 text-sm text-foreground placeholder:text-muted-foreground focus:border-gold focus:outline-none"
        />
        <div className="mt-5 flex items-center justify-between gap-4">
          <span className="text-xs text-muted-foreground">
            {done ? "Missão cumprida — selo lavrado." : "Marca como cumprida ao concluir a tarefa."}
          </span>
          <button
            onClick={handleToggle}
            className={`label-eyebrow border px-5 py-2 transition-all ${
              done
                ? "border-gold bg-gold text-aegean"
                : "border-aegean text-aegean hover:border-gold hover:bg-gold/10"
            }`}
          >
            {done ? "✓ Cumprida" : "Marcar cumprida"}
          </button>
        </div>
      </div>
    </section>
  );
}
