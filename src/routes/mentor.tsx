import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import { PageShell, PageHero } from "@/components/PageShell";
import { Owl, LaurelDivider } from "@/components/Ornaments";
import { loadFrases } from "@/lib/frases";

export const Route = createFileRoute("/mentor")({
  head: () => ({
    meta: [
      { title: "Mentor IA — Giacomo Casanova | Santuário do Glow-up" },
      { name: "description", content: "Conversa com Giacomo Casanova: conselheiro digital sobre estética, verbo e estratégia." },
      { property: "og:title", content: "Mentor IA — Giacomo Casanova" },
      { property: "og:description", content: "O libertino erudito ao teu serviço, em diálogo aberto." },
    ],
  }),
  component: Mentor,
});

type Msg = { role: "user" | "assistant"; content: string };
type Conversation = { id: string; title: string; createdAt: number; messages: Msg[] };

const STORAGE_KEY = "santuario.mentor.conversations.v1";
const ACTIVE_KEY = "santuario.mentor.active.v1";

const SUGGESTIONS = [
  "Como cultivar uma presença magnética sem parecer arrogante?",
  "Ela respondeu com uma só palavra. Que silêncio devo praticar?",
  "Que ritual matinal recomendas para afiar o porte físico?",
  "Como falar em público com gravidade sem soar pomposo?",
  "Recomenda-me três livros para entender o desejo humano.",
];

function uid() { return Math.random().toString(36).slice(2, 10); }

function newConversation(): Conversation {
  return { id: uid(), title: "Nova consulta", createdAt: Date.now(), messages: [] };
}

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/mentor-chat`;
const ANON = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

function Mentor() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeId, setActiveId] = useState<string>("");
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scrollerRef = useRef<HTMLDivElement>(null);

  // Load from localStorage
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      const list: Conversation[] = raw ? JSON.parse(raw) : [];
      const active = localStorage.getItem(ACTIVE_KEY) || "";
      if (list.length === 0) {
        const c = newConversation();
        setConversations([c]);
        setActiveId(c.id);
      } else {
        setConversations(list);
        setActiveId(list.find((c) => c.id === active)?.id || list[0].id);
      }
    } catch {
      const c = newConversation();
      setConversations([c]);
      setActiveId(c.id);
    }
  }, []);

  // Persist
  useEffect(() => {
    if (conversations.length) localStorage.setItem(STORAGE_KEY, JSON.stringify(conversations));
  }, [conversations]);
  useEffect(() => {
    if (activeId) localStorage.setItem(ACTIVE_KEY, activeId);
  }, [activeId]);

  const active = useMemo(
    () => conversations.find((c) => c.id === activeId),
    [conversations, activeId],
  );

  useEffect(() => {
    scrollerRef.current?.scrollTo({ top: scrollerRef.current.scrollHeight, behavior: "smooth" });
  }, [active?.messages.length, isStreaming]);

  function updateActive(updater: (c: Conversation) => Conversation) {
    setConversations((prev) => prev.map((c) => (c.id === activeId ? updater(c) : c)));
  }

  function startNew() {
    const c = newConversation();
    setConversations((prev) => [c, ...prev]);
    setActiveId(c.id);
    setError(null);
  }

  function deleteConversation(id: string) {
    setConversations((prev) => {
      const next = prev.filter((c) => c.id !== id);
      if (next.length === 0) {
        const c = newConversation();
        setActiveId(c.id);
        return [c];
      }
      if (id === activeId) setActiveId(next[0].id);
      return next;
    });
  }

  async function send(text: string) {
    const trimmed = text.trim();
    if (!trimmed || isStreaming || !active) return;
    setError(null);

    const userMsg: Msg = { role: "user", content: trimmed };
    const baseMessages = [...active.messages, userMsg];
    updateActive((c) => ({
      ...c,
      title: c.messages.length === 0 ? trimmed.slice(0, 48) : c.title,
      messages: [...baseMessages, { role: "assistant", content: "" }],
    }));
    setInput("");
    setIsStreaming(true);

    try {
      const userFrases = loadFrases();
      let payloadMessages = [...baseMessages];
      if (userFrases.length > 0) {
        const frasesContext = userFrases
          .map((f) => `“${f.text}” — extraído de: ${f.bookTitle} (por ${f.bookAuthor})`)
          .join("\n");
        const systemPrompt = `Você é Giacomo Casanova, mentor e conselheiro estético e filosófico. O discípulo com quem você está conversando fixou e valoriza imensamente as seguintes frases extraídas de suas leituras:\n${frasesContext}\nUse essas ideias quando fizer sentido na conversa para criar analogias e complementar seus conselhos, conectando de forma sutil e natural com a sabedoria contida nestas obras.`;
        
        payloadMessages.unshift({
          role: "system" as any,
          content: systemPrompt,
        });
      }

      const resp = await fetch(CHAT_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${ANON}`,
        },
        body: JSON.stringify({ messages: payloadMessages }),
      });

      if (!resp.ok || !resp.body) {
        const data = await resp.json().catch(() => ({}));
        throw new Error(data.error || "O mentor está em silêncio. Tenta novamente.");
      }

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let textBuffer = "";
      let assistantSoFar = "";
      let streamDone = false;

      while (!streamDone) {
        const { done, value } = await reader.read();
        if (done) break;
        textBuffer += decoder.decode(value, { stream: true });

        let nl: number;
        while ((nl = textBuffer.indexOf("\n")) !== -1) {
          let line = textBuffer.slice(0, nl);
          textBuffer = textBuffer.slice(nl + 1);
          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (line.startsWith(":") || line.trim() === "") continue;
          if (!line.startsWith("data: ")) continue;
          const jsonStr = line.slice(6).trim();
          if (jsonStr === "[DONE]") { streamDone = true; break; }
          try {
            const parsed = JSON.parse(jsonStr);
            const delta = parsed.choices?.[0]?.delta?.content as string | undefined;
            if (delta) {
              assistantSoFar += delta;
              const snapshot = assistantSoFar;
              setConversations((prev) => prev.map((c) => {
                if (c.id !== activeId) return c;
                const msgs = [...c.messages];
                msgs[msgs.length - 1] = { role: "assistant", content: snapshot };
                return { ...c, messages: msgs };
              }));
            }
          } catch {
            textBuffer = line + "\n" + textBuffer;
            break;
          }
        }
      }
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Erro inesperado";
      setError(msg);
      // remove empty assistant placeholder
      updateActive((c) => {
        const msgs = [...c.messages];
        if (msgs.length && msgs[msgs.length - 1].role === "assistant" && !msgs[msgs.length - 1].content) {
          msgs.pop();
        }
        return { ...c, messages: msgs };
      });
    } finally {
      setIsStreaming(false);
    }
  }

  return (
    <PageShell>
      <PageHero
        eyebrow="Mentor IA"
        title="Giacomo Casanova"
        intro="Veneziano, polímata, sedutor. Renasce aqui em forma digital para examinar contigo cada gesto, cada hesitação."
      />

      <section className="mx-auto max-w-6xl px-6 py-16">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-[260px_1fr]">
          {/* Sidebar — histórico */}
          <aside className="border border-gold/40 bg-card p-5">
            <button
              onClick={startNew}
              className="w-full rounded-sm bg-aegean px-4 py-2 text-xs font-medium uppercase tracking-widest text-marble transition hover:bg-aegean/90"
            >
              + Nova consulta
            </button>
            <p className="mt-6 label-eyebrow">Histórico</p>
            <ul className="mt-3 space-y-1 max-h-[420px] overflow-y-auto">
              {conversations.map((c) => (
                <li key={c.id} className="group flex items-center gap-1">
                  <button
                    onClick={() => setActiveId(c.id)}
                    className={`flex-1 truncate rounded-sm px-2 py-2 text-left text-sm transition ${
                      c.id === activeId
                        ? "bg-gold/15 text-aegean"
                        : "text-aegean/70 hover:bg-muted"
                    }`}
                    title={c.title}
                  >
                    {c.title || "Sem título"}
                  </button>
                  <button
                    onClick={() => deleteConversation(c.id)}
                    className="px-1 text-xs text-muted-foreground opacity-0 transition group-hover:opacity-100 hover:text-terracotta"
                    aria-label="Apagar"
                  >
                    ✕
                  </button>
                </li>
              ))}
            </ul>
          </aside>

          {/* Chat */}
          <div className="border border-gold/40 bg-card">
            <div className="flex items-center gap-3 border-b border-border px-6 py-4">
              <Owl className="h-8 w-8 text-aegean" />
              <div>
                <p className="label-eyebrow">Confidente</p>
                <p className="font-display text-lg italic text-aegean">Giacomo Casanova</p>
              </div>
            </div>

            <div ref={scrollerRef} className="max-h-[55vh] min-h-[380px] space-y-6 overflow-y-auto px-6 py-6">
              {(!active || active.messages.length === 0) && (
                <div className="space-y-6">
                  <p className="font-display text-xl italic text-aegean">
                    “Apresenta-te, meu caro. Que dilema te traz à minha mesa?”
                  </p>
                  <div>
                    <p className="label-eyebrow">Sugestões</p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {SUGGESTIONS.map((s) => (
                        <button
                          key={s}
                          onClick={() => send(s)}
                          disabled={isStreaming}
                          className="rounded-sm border border-gold/50 px-3 py-2 text-left text-sm text-aegean transition hover:bg-gold/10 disabled:opacity-50"
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {active?.messages.map((m, i) => (
                <div
                  key={i}
                  className={
                    m.role === "assistant"
                      ? "border-l-2 border-primary pl-5"
                      : "border-l-2 border-primary/30 pl-5"
                  }
                >
                  <p className="label-eyebrow">{m.role === "assistant" ? "Casanova" : "Tu"}</p>
                  <div
                    className={`mt-2 leading-relaxed ${
                      m.role === "assistant"
                        ? "font-display text-2xl italic text-primary prose prose-lg max-w-none"
                        : "text-xl text-foreground"
                    }`}
                  >
                    {m.role === "assistant" ? (
                      <ReactMarkdown>{m.content || "…"}</ReactMarkdown>
                    ) : (
                      m.content
                    )}
                  </div>
                </div>
              ))}

              {error && (
                <p className="border-l-2 border-terracotta pl-5 text-sm italic text-terracotta">
                  {error}
                </p>
              )}
            </div>

            <LaurelDivider className="opacity-60" />

            <form
              className="px-6 py-5"
              onSubmit={(e) => { e.preventDefault(); send(input); }}
            >
              <div className="flex items-end gap-3">
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      send(input);
                    }
                  }}
                  placeholder="Mestre, encontrei-a no salão e..."
                  rows={2}
                  disabled={isStreaming}
                  className="flex-1 resize-none rounded-sm border border-border bg-background p-4 font-display text-xl text-foreground outline-none transition focus:border-primary disabled:opacity-60"
                />
                <button
                  type="submit"
                  disabled={isStreaming || !input.trim()}
                  className="rounded-sm bg-aegean px-5 py-3 text-xs font-medium uppercase tracking-widest text-marble transition hover:bg-aegean/90 disabled:opacity-50"
                >
                  {isStreaming ? "…" : "Enviar"}
                </button>
              </div>
              <p className="mt-2 text-xs text-muted-foreground">
                Enter envia · Shift+Enter quebra linha · histórico guardado neste dispositivo
              </p>
            </form>
          </div>
        </div>
      </section>
    </PageShell>
  );
}
