import { Link } from "@tanstack/react-router";
import { useAscensao } from "@/hooks/useAscensao";
import { getMissionMeta, loadFieldNote, MISSIONS } from "@/lib/missions";

export function FieldReportCard() {
  const { state } = useAscensao();
  const done = state.missionsDone;

  if (done.length === 0) {
    return (
      <section className="mx-auto max-w-4xl px-6 pb-16">
        <p className="label-eyebrow text-center">Field Reports</p>
        <h3 className="mt-2 text-center font-display text-3xl text-aegean">Nenhuma missão lavrada</h3>
        <p className="mx-auto mt-4 max-w-xl text-center text-foreground/70">
          Os teus relatórios de campo aparecerão aqui assim que cumprires a primeira missão.
        </p>
        <div className="mt-8 text-center">
          <Link
            to="/aura"
            className="label-eyebrow border border-aegean px-5 py-2 text-aegean hover:bg-aegean hover:text-marble"
          >
            Iniciar missões
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-4xl px-6 pb-16">
      <p className="label-eyebrow text-center">Field Reports</p>
      <h3 className="mt-2 text-center font-display text-3xl text-aegean">Histórico de missões</h3>
      <p className="mt-2 text-center text-sm text-muted-foreground">
        {done.length} de {MISSIONS.length} missões cumpridas
      </p>

      <ul className="mt-10 space-y-4">
        {done.map((id) => {
          const meta = getMissionMeta(id);
          const note = loadFieldNote(id);
          return (
            <li
              key={id}
              className="border border-gold/40 bg-card p-6 shadow-[0_0_24px_-14px_color-mix(in_oklab,var(--gold)_55%,transparent)]"
            >
              <div className="flex items-baseline justify-between gap-4">
                <div>
                  <p className="label-eyebrow">{meta.pillar}</p>
                  <h4 className="mt-1 font-display text-2xl text-aegean">{meta.title}</h4>
                </div>
              </div>
              {note ? (
                <blockquote className="mt-4 border-l-2 border-gold/60 pl-4 text-sm italic text-foreground/80">
                  {note}
                </blockquote>
              ) : (
                <p className="mt-4 text-sm text-muted-foreground">Sem registo escrito — apenas a acção.</p>
              )}
              <div className="mt-4 text-right">
                <Link to={meta.href} className="text-xs uppercase tracking-widest text-aegean hover:text-gold">
                  Rever pilar →
                </Link>
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
