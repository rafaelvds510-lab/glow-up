import { createFileRoute, Link } from "@tanstack/react-router";
import { PageShell } from "@/components/PageShell";
import { ColumnLogo, LaurelDivider, Owl, Roman } from "@/components/Ornaments";
import { useEffect, useState } from "react";
import { getRandomPensamento } from "@/lib/frases";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Santuário do Glow-up" },
      { name: "description", content: "Transformação integral: estética e aura. Um santuário clássico para a evolução masculina." },
      { property: "og:title", content: "Santuário do Glow-up" },
      { property: "og:description", content: "Aura — o caminho clássico da transformação." },
    ],
  }),
  component: Home,
});

const pillars = [
  { to: "/aura", num: 1, title: "Aura", eyebrow: "Pilar I", desc: "Estética, cuidados com a pele, cabelo e estilo. A forma como o mundo te lê antes de tu falares." }
] as const;

function Home() {
  const [pensamento, setPensamento] = useState(() => getRandomPensamento());

  useEffect(() => {
    const sync = () => setPensamento(getRandomPensamento());
    window.addEventListener("frases:update", sync);
    return () => window.removeEventListener("frases:update", sync);
  }, []);

  return (
    <PageShell>
      {/* HERO */}
      <section className="relative overflow-hidden border-b border-border/60">
        <div className="pointer-events-none absolute inset-0 opacity-[0.035]" style={{
          backgroundImage: "radial-gradient(circle at 20% 30%, var(--ink) 1px, transparent 1px), radial-gradient(circle at 70% 80%, var(--ink) 1px, transparent 1px)",
          backgroundSize: "40px 40px, 60px 60px",
        }} />
        <div className="mx-auto grid max-w-6xl grid-cols-1 items-center gap-12 px-6 py-24 md:grid-cols-[1fr_auto_1fr] md:py-32">
          <div className="text-right">
            <p className="label-eyebrow">Anno MMXXVI</p>
            <h1 className="mt-4 font-display text-6xl leading-[0.95] text-aegean md:text-7xl">
              Torna-te<br/>
              <span className="italic text-terracotta">obra</span><br/>
              de arte.
            </h1>
          </div>
          <ColumnLogo className="mx-auto h-48 w-32 text-gold" />
          <div>
            <p className="max-w-sm text-lg leading-relaxed text-foreground/80">
              Um santuário para o homem que decidiu esculpir-se. Aqui não há atalhos —
              há disciplina, beleza e o método dos antigos.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/habitos" className="inline-flex items-center justify-center rounded-sm border border-aegean/40 px-6 py-3 text-sm font-medium uppercase tracking-widest text-aegean transition hover:bg-aegean/5">
                Iniciar ritual
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* MANIFESTO */}
      <section className="mx-auto max-w-3xl px-6 py-20 text-center">
        <LaurelDivider />
        <p className="mt-10 font-display text-2xl italic leading-relaxed text-aegean md:text-3xl">
          “O mármore já contém a estátua. Cabe ao escultor remover o que sobra
          até que a forma divina apareça.”
        </p>
        <p className="mt-4 label-eyebrow">— Manifesto</p>
      </section>

      {/* PILLARS */}
      <section className="border-t border-border/60 bg-muted/40">
        <div className="mx-auto max-w-6xl px-6 py-24">
          <div className="mb-14 text-center">
            <p className="label-eyebrow">Os três pilares</p>
            <h2 className="mt-3 font-display text-4xl text-aegean md:text-5xl">A trindade da transformação</h2>
          </div>
          <div className="grid grid-cols-1 gap-px overflow-hidden border border-border bg-border md:grid-cols-3">
            {pillars.map((p) => (
              <Link key={p.to} to={p.to} className="group flex flex-col bg-card p-10 transition-colors hover:bg-marble">
                <div className="flex items-center justify-between">
                  <span className="label-eyebrow">{p.eyebrow}</span>
                  <span className="font-display text-3xl text-gold"><Roman n={p.num} /></span>
                </div>
                <h3 className="mt-8 font-display text-4xl text-aegean">{p.title}</h3>
                <p className="mt-4 flex-1 text-foreground/75">{p.desc}</p>
                <span className="mt-8 inline-flex items-center gap-2 text-sm uppercase tracking-widest text-terracotta transition-transform group-hover:translate-x-1">
                  Adentrar →
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* PREVIEW BLOCKS */}
      <section className="border-t border-border/60 bg-aegean text-marble">
        <div className="mx-auto grid max-w-6xl grid-cols-1 gap-px bg-marble/15 md:grid-cols-2">
          <Link to="/habitos" className="group bg-aegean p-12 transition-colors hover:bg-aegean/90">
            <p className="label-eyebrow !text-gold">Disciplina</p>
            <h3 className="mt-4 font-display text-4xl">Ritual diário</h3>
            <p className="mt-4 max-w-md text-marble/80">
              Um checklist de hábitos que esculpe corpo, voz e mente —
              repetição é a oração dos antigos.
            </p>
            <span className="mt-6 inline-block text-sm uppercase tracking-widest text-gold group-hover:translate-x-1">
              Iniciar →
            </span>
          </Link>
          <Link to="/biblioteca" className="group bg-aegean p-12 transition-colors hover:bg-aegean/90">
            <p className="label-eyebrow !text-gold">Erudição</p>
            <h3 className="mt-4 font-display text-4xl">Biblioteca</h3>
            <p className="mt-4 max-w-md text-marble/80">
              Curadoria de clássicos e modernos — Plutarco, Marco Aurélio, Greene.
              Os ombros sobre os quais te elevas.
            </p>
            <span className="mt-6 inline-block text-sm uppercase tracking-widest text-gold group-hover:translate-x-1">
              Explorar →
            </span>
          </Link>
        </div>
      </section>
    </PageShell>
  );
}
