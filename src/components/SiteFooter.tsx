import { LaurelDivider } from "./Ornaments";

export function SiteFooter() {
  return (
    <footer className="mt-24 border-t border-border/60 bg-background">
      <div className="mx-auto max-w-6xl px-6 py-14">
        <LaurelDivider />
        <p className="mt-8 text-center font-display text-xl italic text-aegean">
          “Conhece-te a ti mesmo, e conhecerás o universo e os deuses.”
        </p>
        <p className="mt-2 text-center label-eyebrow">— Inscrição do Templo de Delfos</p>
        <div className="mt-10 flex flex-col items-center justify-between gap-4 text-sm text-muted-foreground md:flex-row">
          <span>© {new Date().getFullYear()} Santuário do Glow-up</span>
        </div>
      </div>
    </footer>
  );
}
