import { Roman, LaurelDivider } from "@/components/Ornaments";

export type Principle = { title: string; body: string };

export function PrincipleList({ items }: { items: Principle[] }) {
  return (
    <div className="mx-auto max-w-3xl">
      {items.map((p, i) => (
        <article key={i} className="grid grid-cols-[auto_1fr] gap-8 border-t border-border py-10 last:border-b">
          <div className="font-display text-4xl text-gold leading-none w-14"><Roman n={i + 1} /></div>
          <div>
            <h3 className="font-display text-2xl text-aegean">{p.title}</h3>
            <p className="mt-3 leading-relaxed text-foreground/80">{p.body}</p>
          </div>
        </article>
      ))}
    </div>
  );
}

export function RitualBlock({ items }: { items: string[] }) {
  return (
    <section className="mx-auto max-w-3xl px-6 py-20">
      <LaurelDivider />
      <p className="mt-10 text-center label-eyebrow">Ritual prático</p>
      <ul className="mt-8 space-y-3">
        {items.map((it, i) => (
          <li key={i} className="flex gap-4 border-l-2 border-gold pl-4 text-foreground/85">
            <span className="font-display text-gold">{String(i + 1).padStart(2, "0")}</span>
            <span>{it}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
