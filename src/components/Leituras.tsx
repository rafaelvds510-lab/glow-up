import { useEffect, useMemo, useState } from "react";
import { PageShell, PageHero } from "@/components/PageShell";
import {
  loadLeituras,
  upsertLeitura,
  removeLeitura,
  pctRead,
  STATUS_LABEL,
  type ReadingEntry,
  type ReadingStatus,
} from "@/lib/leituras";
import {
  loadMetaMensal,
  saveMetaMensal,
  pagesThisMonth,
} from "@/lib/biblioteca-state";

const STATUSES: ReadingStatus[] = ["lendo", "quero", "lido"];

export function LeiturasPage() {
  const [map, setMap] = useState<Record<string, ReadingEntry>>({});
  const [filter, setFilter] = useState<ReadingStatus | "todas">("todas");

  useEffect(() => {
    const sync = () => setMap(loadLeituras());
    sync();
    window.addEventListener("leituras:update", sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener("leituras:update", sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  const entries = useMemo(() => {
    const arr = Object.entries(map);
    arr.sort((a, b) => b[1].updatedAt.localeCompare(a[1].updatedAt));
    return filter === "todas" ? arr : arr.filter(([, e]) => e.status === filter);
  }, [map, filter]);

  const counts = useMemo(() => {
    const c: Record<ReadingStatus, number> = { quero: 0, lendo: 0, lido: 0 };
    Object.values(map).forEach((e) => (c[e.status] += 1));
    return c;
  }, [map]);

  return (
    <div className="w-full">
      <section className="mx-auto max-w-5xl px-6 pt-12">
        <MonthlyGoal />
      </section>

      <section className="mx-auto max-w-5xl px-6 py-10">
        <div className="grid grid-cols-3 gap-px border border-border bg-border">
          {STATUSES.map((s) => (
            <div key={s} className="bg-card p-6 text-center">
              <p className="label-eyebrow">{STATUS_LABEL[s]}</p>
              <p className="mt-2 font-display text-4xl text-aegean">{counts[s]}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-6 pb-12">
        <NewReadingForm />
      </section>

      <section className="mx-auto max-w-5xl px-6 pb-24">
        <div className="mb-6 flex flex-wrap items-center gap-3">
          <span className="label-eyebrow">Filtrar:</span>
          {(["todas", ...STATUSES] as const).map((s) => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`rounded-full border px-4 py-1.5 text-sm transition ${
                filter === s
                  ? "border-gold bg-gold/10 text-aegean"
                  : "border-border text-muted-foreground hover:border-gold/60 hover:text-aegean"
              }`}
            >
              {s === "todas" ? "Todas" : STATUS_LABEL[s]}
            </button>
          ))}
        </div>

        {entries.length === 0 ? (
          <p className="border border-dashed border-border bg-card p-10 text-center italic text-muted-foreground">
            Nenhuma leitura registada {filter !== "todas" ? "neste estado" : "ainda"}. Abre um volume.
          </p>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {entries.map(([key, e]) => (
              <ReadingRow key={key} k={key} entry={e} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function NewReadingForm() {
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [totalPages, setTotalPages] = useState("");
  const [status, setStatus] = useState<ReadingStatus>("quero");

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    const key = `${title.trim()}::${author.trim()}`.toLowerCase();
    
    upsertLeitura(key, {
      title: title.trim(),
      author: author.trim() || "—",
      status,
      totalPages: Number(totalPages) || 0,
      currentPage: 0,
    });
    setTitle("");
    setAuthor("");
    setTotalPages("");
    setStatus("quero");
  }

  return (
    <form onSubmit={submit} className="border border-gold/40 bg-card p-6">
      <p className="label-eyebrow">Adicionar volume</p>
      <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-[2fr_2fr_1fr_1fr_2fr_auto]">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Título"
          className="border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-primary"
        />
        <input
          value={author}
          onChange={(e) => setAuthor(e.target.value)}
          placeholder="Autor"
          className="border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-primary"
        />
        <input
          type="number"
          min={0}
          value={totalPages}
          onChange={(e) => setTotalPages(e.target.value)}
          placeholder="Páginas"
          className="border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-primary"
        />
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value as ReadingStatus)}
          className="border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-primary"
        >
          {STATUSES.map((s) => (
            <option key={s} value={s}>
              {STATUS_LABEL[s]}
            </option>
          ))}
        </select>
        <button
          type="submit"
          className="border border-primary bg-primary/10 px-5 py-2 text-sm uppercase tracking-widest text-primary transition hover:bg-primary/20"
        >
          Adicionar
        </button>
      </div>
    </form>
  );
}

function ReadingRow({ k, entry }: { k: string; entry: ReadingEntry }) {
  const pct = pctRead(entry);

  return (
    <article className="border border-border bg-card p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <h3 className="font-display text-xl leading-tight text-aegean">{entry.title}</h3>
          <p className="mt-1 text-sm italic text-muted-foreground">{entry.author}</p>
        </div>
        <div className="flex items-center gap-2">
          {entry.status === "lendo" && (
            <button
              onClick={() =>
                upsertLeitura(k, {
                  title: entry.title,
                  author: entry.author,
                  currentPage: entry.totalPages || 0,
                  status: "lido",
                })
              }
              className="border border-gold bg-gold/10 px-3 py-1.5 text-xs uppercase tracking-widest text-aegean hover:bg-gold/20 transition"
            >
              Concluir Leitura
            </button>
          )}
          <select
            value={entry.status}
            onChange={(e) =>
              upsertLeitura(k, {
                title: entry.title,
                author: entry.author,
                status: e.target.value as ReadingStatus,
              })
            }
            className="border border-border bg-background px-3 py-1.5 text-xs uppercase tracking-widest text-foreground outline-none focus:border-primary"
          >
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {STATUS_LABEL[s]}
              </option>
            ))}
          </select>
          <button
            onClick={() => removeLeitura(k)}
            className="border border-border px-3 py-1.5 text-xs uppercase tracking-widest text-muted-foreground transition hover:border-terracotta hover:text-terracotta"
            aria-label="Remover"
          >
            ×
          </button>
        </div>
      </div>

      <div className="mt-5">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>
            Página{" "}
            <input
              type="number"
              min={0}
              max={entry.totalPages || undefined}
              value={entry.currentPage}
              onChange={(e) =>
                upsertLeitura(k, {
                  title: entry.title,
                  author: entry.author,
                  currentPage: Math.max(0, Number(e.target.value) || 0),
                })
              }
              className="mx-1 w-16 border border-border bg-background px-2 py-0.5 text-center text-aegean outline-none focus:border-gold"
            />
            de{" "}
            <input
              type="number"
              min={0}
              value={entry.totalPages}
              onChange={(e) =>
                upsertLeitura(k, {
                  title: entry.title,
                  author: entry.author,
                  totalPages: Math.max(0, Number(e.target.value) || 0),
                })
              }
              className="mx-1 w-16 border border-border bg-background px-2 py-0.5 text-center text-aegean outline-none focus:border-gold"
            />
          </span>
          <span className="font-display text-base text-gold">{pct}%</span>
        </div>
        <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-border">
          <div
            className="h-full bg-gradient-to-r from-gold to-terracotta transition-all"
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>
    </article>
  );
}

function MonthlyGoal() {
  const [goal, setGoal] = useState(0);
  const [read, setRead] = useState(0);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState("");

  useEffect(() => {
    const sync = () => {
      setGoal(loadMetaMensal());
      setRead(pagesThisMonth());
    };
    sync();
    window.addEventListener("meta:update", sync);
    window.addEventListener("paginas:update", sync);
    window.addEventListener("leituras:update", sync);
    return () => {
      window.removeEventListener("meta:update", sync);
      window.removeEventListener("paginas:update", sync);
      window.removeEventListener("leituras:update", sync);
    };
  }, []);

  const pct = goal > 0 ? Math.min(100, Math.round((read / goal) * 100)) : 0;
  const monthLabel = new Date().toLocaleDateString("pt-PT", { month: "long", year: "numeric" });

  return (
    <div className="border border-gold/40 bg-card p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="label-eyebrow">Meta mensal · {monthLabel}</p>
          <p className="mt-2 font-display text-3xl text-aegean">
            {read} <span className="text-muted-foreground">/ {goal || "—"}</span>{" "}
            <span className="text-base text-muted-foreground">páginas</span>
          </p>
        </div>
        {editing ? (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              saveMetaMensal(Number(draft) || 0);
              setEditing(false);
            }}
            className="flex items-center gap-2"
          >
            <input
              type="number"
              min={0}
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              autoFocus
              className="w-24 border border-border bg-background px-3 py-1.5 text-sm text-aegean outline-none focus:border-gold"
              placeholder="páginas"
            />
            <button
              type="submit"
              className="border border-gold bg-gold/10 px-4 py-1.5 text-xs uppercase tracking-widest text-aegean hover:bg-gold/20"
            >
              Salvar
            </button>
          </form>
        ) : (
          <button
            onClick={() => {
              setDraft(String(goal || ""));
              setEditing(true);
            }}
            className="border border-border px-4 py-1.5 text-xs uppercase tracking-widest text-muted-foreground transition hover:border-gold hover:text-aegean"
          >
            {goal ? "Editar meta" : "Definir meta"}
          </button>
        )}
      </div>

      <div className="mt-5">
        <div className="h-2 w-full overflow-hidden rounded-full bg-border">
          <div
            className="h-full bg-gradient-to-r from-gold via-gold to-terracotta transition-all"
            style={{ width: `${pct}%` }}
          />
        </div>
        <div className="mt-2 flex justify-between text-xs text-muted-foreground">
          <span>{pct}% do mês</span>
          <span>
            {goal > 0 && read >= goal
              ? "Meta cumprida — eleva o teto."
              : goal > 0
                ? `Faltam ${Math.max(0, goal - read)} páginas`
                : "Define uma meta para começar."}
          </span>
        </div>
      </div>
    </div>
  );
}
