import { createFileRoute, Link } from "@tanstack/react-router";
import { LaurelDivider } from "@/components/Ornaments";

export const Route = createFileRoute("/aura/")({
  head: () => ({
    meta: [
      { title: "Aura — Visão Geral | Santuário do Glow-up" },
      { name: "description", content: "Mapa do arsenal estético: barba, cabelo, vestuário, perfume, acessórios, skincare e postura." },
    ],
  }),
  component: AuraIndex,
});

const sections = [
  { to: "/aura/barba", title: "Barba & Rosto", body: "Alinhamento dos fios e cuidado com a pele por baixo da barba." },
  { to: "/aura/cabelo", title: "Cabelo — A Coroa", body: "Visagismo aplicado: o corte ideal para a tua estrutura óssea." },
  { to: "/aura/vestuario", title: "Vestuário — A Armadura", body: "Caimento, psicologia das cores e o armário cápsula de autoridade." },
  { to: "/aura/perfume", title: "Perfume — A Assinatura Invisível", body: "Notas, ocasiões e os pontos estratégicos de aplicação." },
  { to: "/aura/acessorios", title: "Acessórios — O Toque de Ouro", body: "Relógios, anéis e óculos. O metal que conclui — sem excesso." },
  { to: "/aura/skincare", title: "Pele & Higiene", body: "Limpeza, hidratação e proteção solar. Mármore vivo." },
] as const;

function AuraIndex() {
  return (
    <>
      <section className="mx-auto max-w-5xl px-6 py-16">
        <p className="label-eyebrow text-center">Mapa do arsenal</p>
        <h2 className="mt-3 text-center font-display text-3xl text-aegean md:text-4xl">
          Sete frentes, uma só presença
        </h2>
        <div className="mt-10 grid grid-cols-1 gap-px overflow-hidden rounded-sm border border-border bg-border md:grid-cols-2">
          {sections.map((s) => (
            <Link
              key={s.to}
              to={s.to}
              className="group flex flex-col gap-2 bg-card p-6 transition-colors hover:bg-gold/5"
            >
              <span className="label-eyebrow">{s.title.split(" — ")[1] ?? "—"}</span>
              <h3 className="font-display text-2xl text-aegean group-hover:text-terracotta">
                {s.title.split(" — ")[0]}
              </h3>
              <p className="text-sm text-foreground/75">{s.body}</p>
              <span className="mt-2 text-xs text-gold opacity-0 transition-opacity group-hover:opacity-100">
                Entrar →
              </span>
            </Link>
          ))}
        </div>
        <div className="py-12">
          <LaurelDivider />
        </div>
      </section>
    </>
  );
}
