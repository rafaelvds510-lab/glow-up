import { SiteHeader } from "./SiteHeader";
import { SiteFooter } from "./SiteFooter";

export function PageShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteHeader />
      <main>{children}</main>
      <SiteFooter />
    </div>
  );
}

export function PageHero({
  eyebrow,
  title,
  intro,
}: {
  eyebrow: string;
  title: string;
  intro?: string;
}) {
  return (
    <section className="border-b border-border/60">
      <div className="mx-auto max-w-4xl px-6 py-20 text-center">
        <p className="label-eyebrow">{eyebrow}</p>
        <h1 className="mt-4 font-display text-5xl leading-[1.05] text-aegean md:text-7xl">
          {title}
        </h1>
        {intro && (
          <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">{intro}</p>
        )}
      </div>
    </section>
  );
}
