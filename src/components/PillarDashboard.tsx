import { Link } from "@tanstack/react-router";
import { useAscensao } from "@/hooks/useAscensao";
import { PILLARS, computePillarProgress, type PillarProgress } from "@/lib/pillars";

export function PillarDashboard() {
  const { state } = useAscensao();
  const rows = PILLARS.map((p) => computePillarProgress(p, state.pagesVisited, state.missionsDone));
  const overall = Math.round(rows.reduce((acc, r) => acc + r.pct, 0) / rows.length);

  return (
    <section className="mx-auto max-w-5xl px-6 py-12">
      <p className="label-eyebrow text-center">Dashboard dos Pilares</p>
      <h3 className="mt-2 text-center font-display text-3xl text-aegean">
        A tua tríade — {overall}% completa
      </h3>
      <p className="mx-auto mt-3 max-w-2xl text-center text-sm text-foreground/70">
        Cada pilar mede-se em páginas estudadas e missões cumpridas. Onde a barra dourada falha,
        está o teu próximo passo.
      </p>

      <div className="mt-10 grid gap-6 md:grid-cols-3">
        {rows.map((row) => (
          <PillarCard key={row.pillar.key} row={row} />
        ))}
      </div>
    </section>
  );
}

function PillarCard({ row }: { row: PillarProgress }) {
  const { pillar, pct, pagesDone, pagesTotal, missionsDone, missionsTotal, nextPages, nextMissions } = row;
  const complete = pct >= 100;

  return (
    <article
      className={`flex h-full flex-col border bg-card p-6 transition-colors ${
        complete ? "border-gold shadow-[0_0_28px_-12px_color-mix(in_oklab,var(--gold)_70%,transparent)]" : "border-border"
      }`}
    >
      <header className="flex items-baseline justify-between">
        <h4 className="font-display text-2xl text-aegean">{pillar.name}</h4>
        <span className="font-display text-2xl text-gold">{pct}%</span>
      </header>
      <p className="mt-2 text-xs italic text-foreground/70">{pillar.motto}</p>

      <div className="mt-5 h-2 w-full bg-border">
        <div className="h-full bg-gold transition-all" style={{ width: `${pct}%` }} />
      </div>

      <dl className="mt-4 grid grid-cols-2 gap-3 text-center text-xs">
        <div className="border border-border p-2">
          <dt className="label-eyebrow !text-[0.55rem]">Páginas</dt>
          <dd className="mt-1 font-display text-lg text-aegean">
            {pagesDone}/{pagesTotal}
          </dd>
        </div>
        <div className="border border-border p-2">
          <dt className="label-eyebrow !text-[0.55rem]">Missões</dt>
          <dd className="mt-1 font-display text-lg text-aegean">
            {missionsTotal ? `${missionsDone}/${missionsTotal}` : "—"}
          </dd>
        </div>
      </dl>

      <div className="mt-5 flex-1">
        <p className="label-eyebrow !text-[0.6rem]">Próximos passos</p>
        {nextPages.length === 0 && nextMissions.length === 0 ? (
          <p className="mt-2 text-sm italic text-gold">Pilar dominado. Repete para refinar.</p>
        ) : (
          <ul className="mt-2 space-y-1.5 text-sm">
            {nextMissions.map((m) => (
              <li key={m.id}>
                <Link to={m.href} className="text-aegean hover:text-gold">
                  ▸ Missão: {m.title}
                </Link>
              </li>
            ))}
            {nextPages.map((p) => (
              <li key={p.path}>
                <Link to={p.path} className="text-foreground/80 hover:text-gold">
                  · Estudar {p.label}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>

      <Link
        to={pillar.hub}
        className="label-eyebrow mt-6 border border-aegean px-4 py-2 text-center text-aegean hover:bg-aegean hover:text-marble"
      >
        Entrar no pilar
      </Link>
    </article>
  );
}
