import { PrincipleList, RitualBlock, type Principle } from "@/components/PrincipleList";
import { FieldReport } from "@/components/FieldReport";
import { useVisitPage } from "@/hooks/useAscensao";

export type Mission = {
  id: string;
  title: string;
  brief: string;
  steps?: string[];
};

export function AuraSection({
  eyebrow,
  title,
  intro,
  principles,
  ritual,
  mission,
  pageKey,
  children,
}: {
  eyebrow: string;
  title: string;
  intro: string;
  principles?: Principle[];
  ritual: string[];
  mission?: Mission;
  pageKey?: string;
  children?: React.ReactNode;
}) {
  useVisitPage(pageKey ?? title);
  return (
    <>
      <section className="mx-auto max-w-4xl px-6 pt-14 pb-4 text-center">
        <p className="label-eyebrow">{eyebrow}</p>
        <h2 className="mt-3 font-display text-4xl text-aegean md:text-5xl">{title}</h2>
        <p className="mx-auto mt-5 max-w-2xl text-foreground/75">{intro}</p>
      </section>
      {principles && principles.length > 0 && (
        <section className="mx-auto max-w-5xl px-6 py-12">
          <PrincipleList items={principles} />
        </section>
      )}
      <RitualBlock items={ritual} />
      {mission && (
        <FieldReport id={mission.id} title={mission.title} brief={mission.brief} steps={mission.steps} />
      )}
      {children}
    </>
  );
}
