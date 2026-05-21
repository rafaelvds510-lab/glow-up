import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { PageShell, PageHero } from "@/components/PageShell";
import { loadFavoritos, toggleFavorito } from "@/lib/biblioteca-state";
import { LeiturasPage } from "@/components/Leituras";
import { loadLeituras, upsertLeitura, removeLeitura } from "@/lib/leituras";
import { loadFrases, addFrase, removeFrase, getFrasesByBook, FraseBook } from "@/lib/frases";

export const Route = createFileRoute("/biblioteca")({
  head: () => ({
    meta: [
      { title: "Biblioteca — Curadoria Literária | Santuário do Glow-up" },
      { name: "description", content: "Clássicos e modernos para o homem em transformação." },
      { property: "og:title", content: "Biblioteca — Curadoria Literária" },
      { property: "og:description", content: "Os ombros sobre os quais te elevas." },
    ],
  }),
  component: Biblioteca,
});

type Book = { title: string; author: string; pillar: "Aura" | "Verbo" | "Estratégia"; era: "Clássico" | "Moderno"; note: string };

const books: Book[] = [
  { title: "Meditações", author: "Marco Aurélio", pillar: "Estratégia", era: "Clássico", note: "O imperador estoico em diálogo consigo mesmo. Manual de domínio interior." },
  { title: "Vidas Paralelas", author: "Plutarco", pillar: "Estratégia", era: "Clássico", note: "Biografias comparadas — a virtude masculina sob microscópio histórico." },
  { title: "A Arte de Amar", author: "Ovídio", pillar: "Verbo", era: "Clássico", note: "O primeiro manual romano de sedução. Irônico, preciso, imortal." },
  { title: "Cartas a Lucílio", author: "Sêneca", pillar: "Estratégia", era: "Clássico", note: "Conselhos para uma vida deliberada. Curtas, afiadas, eternas." },
  { title: "História da Minha Vida", author: "Giacomo Casanova", pillar: "Verbo", era: "Clássico", note: "As memórias do mestre. Aventura, prazer e estratégia social em estado puro." },
  { title: "As 48 Leis do Poder", author: "Robert Greene", pillar: "Estratégia", era: "Moderno", note: "Frameworks contemporâneos com raízes em Maquiavel e Sun Tzu." },
  { title: "A Arte da Sedução", author: "Robert Greene", pillar: "Verbo", era: "Moderno", note: "Anatomia psicológica do encanto. Casanova analisado por bisturi moderno." },
  { title: "Modelos", author: "Mark Manson", pillar: "Aura", era: "Moderno", note: "Atração construída sobre honestidade, não performance." },
  { title: "Atomic Habits", author: "James Clear", pillar: "Aura", era: "Moderno", note: "Engenharia de hábitos — a ciência por trás do ritual diário." },
];

type Flirt = { title: string; author: string; note: string };

const devBooks: Flirt[] = [
  { title: "Comece Pelo Porquê", author: "Simon Sinek", note: "Entenda o seu propósito e inspire as pessoas à sua volta a seguirem sua liderança." },
  { title: "Storytelling", author: "Carmine Gallo", note: "Aprenda a contar histórias que cativam e inspiram, dominando a arte da narrativa." },
  { title: "Como Ficar Sozinho", author: "Sara Maitland", note: "Solidão como prática deliberada — a fundação de qualquer homem que não implora companhia." },
  { title: "Homem Suficiente", author: "Justin Baldoni", note: "Desconstrução da masculinidade tóxica sem cair em vitimismo. Vulnerabilidade como força." },
  { title: "Em Busca de Sentido", author: "Viktor Frankl", note: "Sobrevivente de Auschwitz desenha o mapa do propósito. Leitura obrigatória antes dos 30." },
  { title: "12 Regras para a Vida", author: "Jordan B. Peterson", note: "Antídoto ao caos. Doze axiomas para erguer-se da inércia e assumir a tua cruz." },
  { title: "Os Quatro Acordos", author: "Don Miguel Ruiz", note: "Sabedoria tolteca em quatro pactos. Simples, devastador, transformador." },
  { title: "Nunca Divida a Diferença", author: "Chris Voss", note: "O ex-negociador do FBI ensina que toda conversa é uma negociação. Tom de voz como arma." },
  { title: "Como Ser um Homem de 3%", author: "Justin Waller", note: "Disciplina, finanças e mentalidade dos homens que vivem acima da curva. Sem desculpas." },
  { title: "Silêncio", author: "Erling Kagge", note: "O explorador norueguês defende o silêncio como luxo final. O homem ruidoso é o homem inseguro." },
  { title: "Presença", author: "Amy Cuddy", note: "Postura corporal molda química interna. Power poses, ciência aplicada à autoridade." },
  { title: "O Grão de Café", author: "Jon Gordon", note: "Parábola sobre transformar o ambiente em vez de ser transformado por ele." },
  { title: "Como Conversar com Qualquer Pessoa", author: "Leil Lowndes", note: "92 técnicas concretas de small talk, presença social e magnetismo conversacional." },
  { title: "O Efeito Cumulativo", author: "Darren Hardy", note: "Pequenas escolhas, decisões diárias, resultados monumentais. A matemática do glow-up." },
  { title: "Menos Estresse, Mais Conquista", author: "Marc Lesser", note: "Mindfulness aplicada à performance. Calma deliberada vence pressa ansiosa." },
  { title: "A Única Coisa", author: "Gary Keller", note: "Foco brutal numa pergunta: qual é a única coisa que tornaria todo o resto mais fácil?" },
  { title: "A Lógica do Cisne Negro", author: "Nassim Nicholas Taleb", note: "Eventos raros moldam a história. Aprende a posicionar-te para ganhar com a incerteza." },
  { title: "Pai Rico, Pai Pobre", author: "Robert Kiyosaki", note: "A diferença entre ativos e passivos. Educação financeira que a escola te negou." },
  { title: "Por Que o Sexo é Divertido?", author: "Jared Diamond", note: "Biologia evolutiva da sexualidade humana. Entender o porquê liberta-te do roteiro." },
  { title: "O Poder da Resiliência", author: "Al Siebert", note: "Como pessoas extraordinárias prosperam sob pressão. Engenharia mental do antifrágil." },
  { title: "O Clube das 5 da Manhã", author: "Robin Sharma", note: "A primeira hora do dia é o templo. Quem domina a aurora domina a vida." },
  { title: "As Cinco Linguagens do Amor", author: "Gary Chapman", note: "Decodifica como o outro recebe afeto. Sem isso, esforço vira ruído." },
  { title: "Vire o Jogo!", author: "Tim Grover", note: "O treinador de Jordan e Kobe sobre o que separa bons de imparáveis. Mentalidade Cleaner." },
  { title: "Rápido e Devagar", author: "Daniel Kahneman", note: "Sistema 1 e Sistema 2. Como tua mente te engana e o que fazer a respeito." },
  { title: "Versátil", author: "T. D. Jakes", note: "Reinvenção pessoal e profissional sem perder identidade. Para o homem em transição." },
  { title: "Quebrando o Hábito de Ser Você Mesmo", author: "Joe Dispenza", note: "Neurociência aplicada à reinvenção. Tu não és tua biografia." },
  { title: "Arrume a Sua Cama", author: "William H. McRaven", note: "O almirante dos SEALs lista dez lições espartanas. Começa pequeno, vence grande." },
  { title: "A Quietude é a Chave", author: "Ryan Holiday", note: "Estoicismo aplicado: o poder vive na pausa, não na agitação. Marco Aurélio para hoje." },
  { title: "Quando o Corpo Diz Não", author: "Gabor Maté", note: "O custo oculto do estresse reprimido. Doença como alfabeto do não-dito." },
  { title: "Está Tudo F*dido", author: "Mark Manson", note: "Esperança como problema. Manual contra a paralisia existencial moderna." },
  { title: "Como Chegar ao Sim", author: "Roger Fisher & William Ury", note: "Negociação por princípios. O método de Harvard para acordos sem cedências cegas." },
  { title: "As Mulheres Primeiro", author: "Aaron Karo", note: "Crônica masculina sobre desejo, decepção e crescimento. Espelho honesto." },
  { title: "Como Fazer Amigos e Influenciar Pessoas", author: "Dale Carnegie", note: "O cânone. Décadas depois, ainda é o ABC do magnetismo social." },
  { title: "Minimalismo Digital", author: "Cal Newport", note: "Reconquista da atenção. Tua mente é o último território não-colonizado pelo algoritmo." },
  { title: "Pense e Enriqueça", author: "Napoleon Hill", note: "O clássico de 1937 sobre desejo ardente, fé e propósito definido. Os mestres releem." },
  { title: "A Arte de Pensar Claramente", author: "Rolf Dobelli", note: "99 vieses cognitivos catalogados. Pensar bem é evitar pensar mal." },
  { title: "O Milagre da Atenção Plena", author: "Thich Nhat Hanh", note: "O monge vietnamita ensina mindfulness sem misticismo. Lavar pratos como meditação." },
  { title: "O Poder do Hábito", author: "Charles Duhigg", note: "Anatomia do loop deixa-rotina-recompensa. Reescrever-te começa por mapear-te." },
  { title: "Memória Sem Limites", author: "Kevin Horsley", note: "Técnicas de memorização dos campeões mundiais. A memória é músculo treinável." },
  { title: "O Poder da Presença", author: "Eckhart Tolle", note: "O agora como única realidade. Antídoto contra a tirania da mente narrativa." },
  { title: "Os 7 Hábitos das Pessoas Altamente Eficazes", author: "Stephen Covey", note: "O framework canônico de eficácia pessoal. Proatividade, fim em mente, primeiro o primeiro." },
  { title: "Ruído", author: "Kahneman, Sibony & Sunstein", note: "Variabilidade indesejada no julgamento humano. Como decisões importantes flutuam ao acaso." },
  { title: "A Coragem de Não Agradar", author: "Kishimi & Koga", note: "Diálogo socrático sobre Adler. Liberta-te da tirania de ser aceito por todos." },
  { title: "Mais Forte do que Nunca", author: "Brené Brown", note: "Cair, levantar, integrar. A neurociência da recuperação emocional madura." },
  { title: "Novas Ideias para uma Vida Melhor", author: "Anthony Robbins", note: "Compilação prática de gatilhos psicológicos para mudança duradoura." },
  { title: "O Princípio 80/20", author: "Richard Koch", note: "Lei de Pareto aplicada a tudo. Encontra os 20% que produzem 80% e descarta o resto." },
  { title: "A Coragem de Ser Imperfeito", author: "Brené Brown", note: "Vulnerabilidade como métrica de coragem. Perfeição é couraça que sufoca." },
  { title: "101 Reflexões que Vão Mudar Sua Vida", author: "Augusto Cury", note: "Aforismos curtos para meditar diariamente. Doses homeopáticas de sabedoria." },
];

const flirtBooks: Flirt[] = [
  { title: "Manual do Nego Doce", author: "Anônimo", note: "O guia prático do charme, atitude e envolvimento magnético na linguagem atual." },
  { title: "Atos de Retórica", author: "Vários", note: "A arte da persuasão e do convencimento através da palavra e do verbo preciso." },
  { title: "A Arte da Sedução", author: "Robert Greene", note: "Os nove arquétipos do sedutor e as táticas que dobram resistências sem ruído." },
  { title: "A Velocidade da Confiança", author: "Stephen M. R. Covey", note: "Confiança como moeda social — sem ela, nenhum flerte sustenta segundo encontro." },
  { title: "Agilidade Emocional", author: "Susan David", note: "Não reprimir, não explodir: dançar com a emoção. O flerte exige fluidez interna." },
  { title: "Inteligência Positiva", author: "Shirzad Chamine", note: "Silenciar os sabotadores internos que travam a tua presença diante do desejo." },
  { title: "Como Se Tornar um Ímã de Pessoas", author: "Marc Reklau", note: "Pequenos gestos de atenção genuína que tornam tua companhia magnética." },
  { title: "A Equação da Felicidade", author: "Mo Gawdat", note: "Felicidade como base — homem carente persegue, homem pleno atrai." },
  { title: "Não Começou com Você", author: "Mark Wolynn", note: "Traumas herdados sabotam intimidade. Cura geracional para amar sem fugir." },
  { title: "A Arte de Ser Feliz", author: "Arthur Schopenhauer", note: "Aforismos sobre autossuficiência — o antídoto filosófico à dependência afectiva." },
  { title: "A Arte Sutil de Conversar", author: "Debra Fine", note: "Manual prático: quebrar o gelo, sustentar e encerrar conversas com elegância." },
  { title: "Conversas Cruciais", author: "Kerry Patterson et al.", note: "Quando a tensão sobe, vencem os que mantêm o diálogo aberto. Aplica-se ao desejo." },
];

function Biblioteca() {
  const [activeTab, setActiveTab] = useState<"acervo" | "leituras" | "notas">("acervo");
  const [query, setQuery] = useState("");
  const [onlyFavs, setOnlyFavs] = useState(false);
  const [favs, setFavs] = useState<string[]>([]);
  const [readMap, setReadMap] = useState<Record<string, any>>({});
  const [selectedBookKey, setSelectedBookKey] = useState<string | null>(null);
  const [frases, setFrases] = useState<FraseBook[]>([]);

  useEffect(() => {
    const sync = () => {
      setFavs(loadFavoritos());
      setReadMap(loadLeituras());
      setFrases(loadFrases());
    };
    sync();
    window.addEventListener("favoritos:update", sync);
    window.addEventListener("leituras:update", sync);
    window.addEventListener("frases:update", sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener("favoritos:update", sync);
      window.removeEventListener("leituras:update", sync);
      window.removeEventListener("frases:update", sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  const q = query.trim().toLowerCase();
  const matches = (title: string, author: string) => {
    const k = bookKey(title, author);
    if (onlyFavs && !favs.includes(k)) return false;
    if (!q) return true;
    return title.toLowerCase().includes(q) || author.toLowerCase().includes(q);
  };

  const filteredBooks = useMemo(() => books.filter((b) => matches(b.title, b.author)), [q, onlyFavs, favs]);
  const filteredFlirt = useMemo(() => flirtBooks.filter((b) => matches(b.title, b.author)), [q, onlyFavs, favs]);
  const filteredDev = useMemo(() => devBooks.filter((b) => matches(b.title, b.author)), [q, onlyFavs, favs]);

  const selectedBook = useMemo(() => {
    if (!selectedBookKey) return null;
    const search = (list: any[]) => list.find(b => bookKey(b.title, b.author) === selectedBookKey);
    return search(books) || search(flirtBooks) || search(devBooks) || null;
  }, [selectedBookKey]);

  const cabeceiraBooks = useMemo(() => {
    const allUnique = new Set<string>();
    favs.forEach(k => allUnique.add(k));
    frases.forEach(f => allUnique.add(f.bookKey));
    
    const list: any[] = [];
    const searchBook = (b: any) => {
      const k = bookKey(b.title, b.author);
      if (allUnique.has(k) && !list.some(x => bookKey(x.title, x.author) === k)) {
        list.push(b);
      }
    };
    
    books.forEach(searchBook);
    flirtBooks.forEach(searchBook);
    devBooks.forEach(searchBook);
    return list;
  }, [favs, frases]);

  const totalShown = filteredBooks.length + filteredFlirt.length + filteredDev.length;

  return (
    <PageShell>
      <PageHero
        eyebrow="Curadoria"
        title="A biblioteca do santuário"
        intro="Os clássicos não envelhecem — apenas esperam pacientemente o leitor à altura."
      />

      <section className="mx-auto max-w-6xl px-6 pt-12">
        <div className="mb-8 flex flex-wrap gap-4 border-b border-border">
          <button
            onClick={() => setActiveTab("acervo")}
            className={`pb-2 text-sm uppercase tracking-widest transition ${activeTab === "acervo" ? "border-b-2 border-primary text-primary font-bold" : "text-muted-foreground hover:text-foreground"}`}
          >
            Acervo
          </button>
          <button
            onClick={() => setActiveTab("leituras")}
            className={`pb-2 text-sm uppercase tracking-widest transition ${activeTab === "leituras" ? "border-b-2 border-primary text-primary font-bold" : "text-muted-foreground hover:text-foreground"}`}
          >
            Leituras e Livros
          </button>
          {selectedBook && (
            <button
              onClick={() => setActiveTab("notas")}
              className={`pb-2 text-sm uppercase tracking-widest transition ${activeTab === "notas" ? "border-b-2 border-primary text-primary font-bold" : "text-muted-foreground hover:text-foreground"}`}
            >
              ✦ Notas: {selectedBook.title}
            </button>
          )}
        </div>
      </section>

      {activeTab === "acervo" ? (
        <>
          {cabeceiraBooks.length > 0 && (
            <section className="mx-auto max-w-6xl px-6 pb-6 animate-in fade-in duration-500">
              <div className="border border-gold/30 bg-card p-6 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 left-0 h-[3px] w-full bg-gradient-to-r from-gold via-primary to-gold" />
                <p className="label-eyebrow mb-4">✦ Notas Rápidas · Livros de Cabeceira</p>
                <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-gold/20">
                  {cabeceiraBooks.map((b) => {
                    const k = bookKey(b.title, b.author);
                    const bookFrasesCount = frases.filter(f => f.bookKey === k).length;
                    return (
                      <button
                        key={k}
                        onClick={() => {
                          setSelectedBookKey(k);
                          setActiveTab("notas");
                        }}
                        className="flex-shrink-0 border border-border bg-muted/30 hover:border-gold hover:bg-gold/5 p-4 text-left transition w-56 flex flex-col justify-between group rounded-sm"
                      >
                        <div>
                          <h4 className="font-display text-base text-aegean leading-snug font-bold group-hover:text-gold transition truncate">{b.title}</h4>
                          <p className="text-xs text-muted-foreground italic truncate">{b.author}</p>
                        </div>
                        <div className="mt-4 flex items-center justify-between">
                          <span className="text-[9px] uppercase tracking-wider text-terracotta">{b.pillar || "Forja"}</span>
                          <span className="text-[10px] font-mono font-bold text-gold flex items-center gap-1">
                            ✦ {bookFrasesCount} frase{bookFrasesCount === 1 ? "" : "s"}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </section>
          )}

          <section className="mx-auto max-w-6xl px-6">
            <div className="flex flex-col gap-3 border border-primary/40 bg-card p-5 md:flex-row md:items-center">
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Buscar por título ou autor…"
                className="flex-1 border border-border bg-background px-4 py-2.5 text-sm text-aegean outline-none focus:border-gold"
              />
              <button
                onClick={() => setOnlyFavs((v) => !v)}
                className={`border px-4 py-2.5 text-xs uppercase tracking-widest transition ${
                  onlyFavs
                    ? "border-gold bg-gold/15 text-aegean font-bold"
                    : "border-border text-muted-foreground hover:border-gold/60 hover:text-aegean"
                }`}
              >
                ★ Favoritos ({favs.length})
              </button>
            </div>
            {q && (
              <p className="mt-3 text-sm text-muted-foreground">
                {totalShown} resultado{totalShown === 1 ? "" : "s"} para "{query}".
              </p>
            )}
          </section>

          {filteredBooks.length > 0 && (
            <section className="mx-auto max-w-6xl px-6 py-12">
              <div className="grid grid-cols-1 gap-px border border-border bg-border sm:grid-cols-2 lg:grid-cols-3">
                {filteredBooks.map((b) => {
                  const k = bookKey(b.title, b.author);
                  const isSelected = selectedBookKey === k;
                  return (
                    <article key={b.title} id={k} className="flex flex-col bg-card p-8 transition-all hover:ring-1 hover:ring-gold/30">
                      <div className="flex items-center justify-between">
                        <span className="label-eyebrow">{b.era}</span>
                        <div className="flex items-center gap-3">
                          <span className="text-xs uppercase tracking-widest text-terracotta">{b.pillar}</span>
                          <FavButton title={b.title} author={b.author} favs={favs} />
                        </div>
                      </div>
                      <div className="mt-8 flex-1">
                        <h3 
                          onClick={() => {
                            setSelectedBookKey(k);
                            setActiveTab("notas");
                          }}
                          className="font-display text-2xl leading-tight text-aegean hover:text-gold transition cursor-pointer flex items-center justify-between group/title"
                        >
                          <span className="truncate">{b.title}</span>
                          <span className="text-[10px] text-gold opacity-0 group-hover/title:opacity-100 transition-opacity uppercase font-mono tracking-widest font-normal flex-shrink-0">
                            ✦ Notas
                          </span>
                        </h3>
                        <p className="mt-1 italic text-muted-foreground">{b.author}</p>
                        <p className="mt-5 text-sm leading-relaxed text-foreground/80">{b.note}</p>
                      </div>
                      
                      <div className="mt-6 border-t border-border/60 pt-4">
                        <BookReadStatusControls book={b} readMap={readMap} />
                      </div>
                      
                      <div className="mt-4 h-px bg-gold/50" />
                    </article>
                  );
                })}
              </div>
            </section>
          )}

          {filteredFlirt.length > 0 && (
            <section className="mx-auto max-w-6xl px-6 pb-20">
              <div className="border-t border-gold/40 pt-12">
                <p className="label-eyebrow">Dossier especial</p>
                <h2 className="mt-2 font-display text-4xl text-aegean">Para flertar como um profissional</h2>
                <div className="mt-10 grid grid-cols-1 gap-px border border-border bg-border sm:grid-cols-2 lg:grid-cols-3">
                  {filteredFlirt.map((b, i) => {
                    const k = bookKey(b.title, b.author);
                    return (
                      <article key={b.title} id={k} className="flex flex-col bg-card p-8 transition-all hover:ring-1 hover:ring-gold/30">
                        <div className="flex items-center justify-between">
                          <span className="font-display text-2xl text-gold">{String(i + 1).padStart(2, "0")}</span>
                          <div className="flex items-center gap-3">
                            <span className="text-xs uppercase tracking-widest text-terracotta">Flerte</span>
                            <FavButton title={b.title} author={b.author} favs={favs} />
                          </div>
                        </div>
                        <div className="mt-6 flex-1">
                          <h3
                            onClick={() => {
                              setSelectedBookKey(k);
                              setActiveTab("notas");
                            }}
                            className="font-display text-xl leading-tight text-aegean hover:text-gold transition cursor-pointer flex items-center justify-between group/title"
                          >
                            <span className="truncate">{b.title}</span>
                            <span className="text-[10px] text-gold opacity-0 group-hover/title:opacity-100 transition-opacity uppercase font-mono tracking-widest font-normal flex-shrink-0">
                              ✦ Notas
                            </span>
                          </h3>
                          <p className="mt-1 italic text-muted-foreground">{b.author}</p>
                          <p className="mt-4 text-sm leading-relaxed text-foreground/80">{b.note}</p>
                        </div>
                        
                        <div className="mt-6 border-t border-border/60 pt-4">
                          <BookReadStatusControls book={b} readMap={readMap} />
                        </div>
                        
                        <div className="mt-4 h-px bg-gold/50" />
                      </article>
                    );
                  })}
                </div>
              </div>
            </section>
          )}

          {filteredDev.length > 0 && (
            <section className="mx-auto max-w-6xl px-6 pb-24">
              <div className="border-t border-gold/40 pt-12">
                <p className="label-eyebrow">Dossier extenso</p>
                <h2 className="mt-2 font-display text-4xl text-aegean">Desenvolvimento pessoal e masculino</h2>
                <div className="mt-10 grid grid-cols-1 gap-px border border-border bg-border sm:grid-cols-2 lg:grid-cols-3">
                  {filteredDev.map((b, i) => {
                    const k = bookKey(b.title, b.author);
                    return (
                      <article key={b.title} id={k} className="flex flex-col bg-card p-8 transition-all hover:ring-1 hover:ring-gold/30">
                        <div className="flex items-center justify-between">
                          <span className="font-display text-2xl text-gold">{String(i + 1).padStart(2, "0")}</span>
                          <div className="flex items-center gap-3">
                            <span className="text-xs uppercase tracking-widest text-terracotta">Forja</span>
                            <FavButton title={b.title} author={b.author} favs={favs} />
                          </div>
                        </div>
                        <div className="mt-6 flex-1">
                          <h3
                            onClick={() => {
                              setSelectedBookKey(k);
                              setActiveTab("notas");
                            }}
                            className="font-display text-xl leading-tight text-aegean hover:text-gold transition cursor-pointer flex items-center justify-between group/title"
                          >
                            <span className="truncate">{b.title}</span>
                            <span className="text-[10px] text-gold opacity-0 group-hover/title:opacity-100 transition-opacity uppercase font-mono tracking-widest font-normal flex-shrink-0">
                              ✦ Notas
                            </span>
                          </h3>
                          <p className="mt-1 italic text-muted-foreground">{b.author}</p>
                          <p className="mt-4 text-sm leading-relaxed text-foreground/80">{b.note}</p>
                        </div>
                        
                        <div className="mt-6 border-t border-border/60 pt-4">
                          <BookReadStatusControls book={b} readMap={readMap} />
                        </div>
                        
                        <div className="mt-4 h-px bg-gold/50" />
                      </article>
                    );
                  })}
                </div>
              </div>
            </section>
          )}

          {totalShown === 0 && (
            <section className="mx-auto max-w-3xl px-6 py-20 text-center">
              <p className="italic text-muted-foreground">
                Nenhum volume corresponde {onlyFavs ? "aos teus favoritos" : "à tua busca"}.
              </p>
            </section>
          )}
        </>
      ) : activeTab === "leituras" ? (
        <LeiturasPage />
      ) : (
        <BookNotesPage 
          book={selectedBook} 
          onBack={() => setActiveTab("acervo")} 
        />
      )}
    </PageShell>
  );
}

function bookKey(title: string, author: string) {
  return `${title}::${author}`.toLowerCase();
}

function FavButton({ title, author, favs }: { title: string; author: string; favs: string[] }) {
  const k = bookKey(title, author);
  const active = favs.includes(k);
  return (
    <button
      onClick={() => toggleFavorito(k)}
      aria-label={active ? "Remover dos favoritos" : "Marcar favorito"}
      className={`text-lg leading-none transition ${active ? "text-gold" : "text-muted-foreground/60 hover:text-gold"}`}
    >
      {active ? "★" : "☆"}
    </button>
  );
}

function BookReadStatusControls({ book, readMap }: { book: any; readMap: Record<string, any> }) {
  const k = bookKey(book.title, book.author);
  const existing = readMap[k];

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-[10px] uppercase tracking-wider text-muted-foreground">Estado:</span>
      {(["quero", "lendo", "lido"] as const).map((s) => (
        <button
          key={s}
          onClick={() => {
            const total = existing?.totalPages || 200;
            upsertLeitura(k, {
              title: book.title,
              author: book.author,
              status: s,
              totalPages: total,
              currentPage: s === "lido" ? total : (s === "quero" ? 0 : (existing?.currentPage || 0))
            });
          }}
          className={`px-2 py-0.5 text-[9px] uppercase tracking-wider border transition-all ${
            existing?.status === s
              ? "border-gold bg-gold/15 text-aegean font-bold"
              : "border-border text-muted-foreground hover:border-gold hover:text-aegean"
          }`}
        >
          {s === "quero" ? "Quero Ler" : s === "lendo" ? "Lendo" : "Lido"}
        </button>
      ))}
      {existing && (
        <button
          onClick={() => removeLeitura(k)}
          className="text-terracotta hover:underline ml-auto text-[9px] uppercase tracking-wider font-semibold"
        >
          Remover
        </button>
      )}
    </div>
  );
}

function BookFrasesArea({ 
  book, 
  isSelected, 
  onToggle 
}: { 
  book: { title: string; author: string }; 
  isSelected: boolean; 
  onToggle: () => void;
}) {
  const [frases, setFrases] = useState<FraseBook[]>([]);
  const [newFraseText, setNewFraseText] = useState("");

  useEffect(() => {
    if (!isSelected) return;
    const sync = () => {
      setFrases(getFrasesByBook(book.title, book.author));
    };
    sync();
    window.addEventListener("frases:update", sync);
    return () => {
      window.removeEventListener("frases:update", sync);
    };
  }, [isSelected, book.title, book.author]);

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFraseText.trim()) return;
    addFrase(book.title, book.author, newFraseText);
    setNewFraseText("");
  };

  const handleRemove = (id: string) => {
    removeFrase(id);
  };

  if (!isSelected) return null;

  return (
    <div className="mt-4 border-t border-gold/20 pt-4 bg-muted/10 p-5 rounded-sm transition-all duration-300">
      <div className="flex items-center justify-between mb-4">
        <h4 className="font-display text-sm tracking-wider uppercase text-gold font-bold">✦ Frases & Aforismos do Livro</h4>
        <button 
          onClick={onToggle} 
          className="text-xs text-muted-foreground hover:text-gold transition-colors"
          title="Colapsar área de frases"
        >
          Fechar
        </button>
      </div>

      {frases.length === 0 ? (
        <p className="text-xs text-muted-foreground italic mb-5 bg-card/30 p-4 border border-dashed border-border rounded-[2px] text-center">
          Nenhuma frase memorável fixada para este livro ainda. Comece a digitar abaixo!
        </p>
      ) : (
        <ul className="space-y-3.5 mb-5 max-h-80 overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-gold/20">
          {frases.map((f) => (
            <li key={f.id} className="group flex items-start gap-3 bg-card/85 p-3.5 border border-border/50 rounded-[2px] transition hover:border-gold/40 shadow-sm">
              <span className="font-display text-gold leading-none select-none text-xl mt-0.5">“</span>
              <p className="flex-1 font-serif text-sm italic text-foreground/90 leading-relaxed break-words whitespace-pre-line">
                {f.text}
              </p>
              <button
                onClick={() => handleRemove(f.id)}
                className="opacity-0 group-hover:opacity-100 text-xs text-muted-foreground hover:text-terracotta transition-opacity duration-200 p-1"
                title="Desfixar frase"
              >
                ✕
              </button>
            </li>
          ))}
        </ul>
      )}

      <form onSubmit={handleAdd} className="flex flex-col gap-3">
        <textarea
          value={newFraseText}
          onChange={(e) => setNewFraseText(e.target.value)}
          placeholder="Insira uma frase ou aforismo marcante que você encontrou nesta leitura..."
          rows={3}
          className="w-full border border-border bg-background p-3.5 text-sm text-foreground outline-none focus:border-gold placeholder:italic rounded-[2px] resize-y min-h-[80px]"
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleAdd(e);
            }
          }}
        />
        <div className="flex justify-between items-center">
          <span className="text-[10px] text-muted-foreground">
            Pressione Enter para fixar · Shift+Enter para nova linha
          </span>
          <button
            type="submit"
            disabled={!newFraseText.trim()}
            className="border border-gold bg-gold/10 px-5 py-2 text-[10px] uppercase tracking-widest text-gold hover:bg-gold/20 disabled:opacity-50 disabled:pointer-events-none rounded-[2px] font-bold transition-all shadow-sm"
          >
            Fixar Frase
          </button>
        </div>
      </form>
    </div>
  );
}

// ─── Gerenciador de Notas por Livro ──────────────────────────────────────────
const NOTES_KEY = "santuario.notas-livro.v1";

function loadNota(bookKey: string): string {
  if (typeof window === "undefined") return "";
  try { return localStorage.getItem(`${NOTES_KEY}::${bookKey}`) ?? ""; }
  catch { return ""; }
}

function saveNota(bKey: string, text: string) {
  try { localStorage.setItem(`${NOTES_KEY}::${bKey}`, text); }
  catch {}
}

// ─── Aba dedicada de Notas e Aforismos por Livro ─────────────────────────────
function BookNotesPage({
  book,
  onBack,
}: {
  book: any | null;
  onBack: () => void;
}) {
  const bKey = book ? bookKey(book.title, book.author) : "";
  const [nota, setNota] = useState("");
  const [saved, setSaved] = useState(false);
  const [frases, setFrases] = useState<FraseBook[]>([]);
  const [newFraseText, setNewFraseText] = useState("");
  const [readMap, setReadMap] = useState<Record<string, any>>({});
  const [favs, setFavs] = useState<string[]>([]);
  const saveTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!book) return;
    setNota(loadNota(bKey));
    setFrases(getFrasesByBook(book.title, book.author));
    setReadMap(loadLeituras());
    setFavs(loadFavoritos());

    const syncFrases = () => setFrases(getFrasesByBook(book.title, book.author));
    const syncRead = () => setReadMap(loadLeituras());
    const syncFavs = () => setFavs(loadFavoritos());
    window.addEventListener("frases:update", syncFrases);
    window.addEventListener("leituras:update", syncRead);
    window.addEventListener("favoritos:update", syncFavs);
    return () => {
      window.removeEventListener("frases:update", syncFrases);
      window.removeEventListener("leituras:update", syncRead);
      window.removeEventListener("favoritos:update", syncFavs);
    };
  }, [bKey, book]);

  const handleNotaChange = (text: string) => {
    setNota(text);
    setSaved(false);
    if (saveTimeout.current) clearTimeout(saveTimeout.current);
    saveTimeout.current = setTimeout(() => {
      saveNota(bKey, text);
      setSaved(true);
    }, 800);
  };

  const handleAddFrase = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFraseText.trim() || !book) return;
    addFrase(book.title, book.author, newFraseText);
    setNewFraseText("");
  };

  if (!book) {
    return (
      <section className="mx-auto max-w-4xl px-6 py-20 text-center">
        <p className="italic text-muted-foreground mb-6">Nenhum livro selecionado.</p>
        <button onClick={onBack} className="border border-gold text-gold px-6 py-2 text-xs uppercase tracking-widest hover:bg-gold/10 transition">
          ← Voltar ao Acervo
        </button>
      </section>
    );
  }

  const existing = readMap[bKey];
  const isFav = favs.includes(bKey);

  return (
    <section className="mx-auto max-w-4xl px-6 py-10 pb-24 animate-in fade-in duration-300">
      {/* Cabeçalho do livro */}
      <div className="relative border border-gold/30 bg-card p-8 mb-8 overflow-hidden">
        <div className="absolute top-0 left-0 h-[3px] w-full bg-gradient-to-r from-gold via-primary to-gold" />
        
        <div className="flex items-start justify-between gap-6 flex-wrap">
          <div className="flex-1 min-w-0">
            <p className="label-eyebrow mb-2">{book.era || book.pillar || "Acervo"}</p>
            <h1 className="font-display text-4xl leading-tight text-aegean">{book.title}</h1>
            <p className="mt-1 text-lg italic text-muted-foreground">{book.author}</p>
            {book.note && (
              <p className="mt-4 text-sm leading-relaxed text-foreground/70 max-w-prose">{book.note}</p>
            )}
          </div>

          <div className="flex flex-col gap-3 items-end flex-shrink-0">
            <button
              onClick={() => toggleFavorito(bKey)}
              className={`text-2xl transition ${isFav ? "text-gold" : "text-muted-foreground/40 hover:text-gold"}`}
              title={isFav ? "Remover dos favoritos" : "Adicionar aos favoritos"}
            >
              {isFav ? "★" : "☆"}
            </button>

            <div className="flex flex-wrap gap-2">
              {(["quero", "lendo", "lido"] as const).map((s) => (
                <button
                  key={s}
                  onClick={() => {
                    const total = existing?.totalPages || 200;
                    upsertLeitura(bKey, {
                      title: book.title,
                      author: book.author,
                      status: s,
                      totalPages: total,
                      currentPage: s === "lido" ? total : (s === "quero" ? 0 : (existing?.currentPage || 0)),
                    });
                  }}
                  className={`px-3 py-1 text-[9px] uppercase tracking-widest border transition-all ${
                    existing?.status === s
                      ? "border-gold bg-gold/15 text-aegean font-bold"
                      : "border-border text-muted-foreground hover:border-gold hover:text-aegean"
                  }`}
                >
                  {s === "quero" ? "Quero Ler" : s === "lendo" ? "Lendo" : "Lido"}
                </button>
              ))}
            </div>
          </div>
        </div>

        <button
          onClick={onBack}
          className="mt-6 inline-flex items-center gap-2 text-xs uppercase tracking-widest text-muted-foreground hover:text-gold transition"
        >
          ← Voltar ao Acervo
        </button>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Notas Pessoais */}
        <div className="border border-border bg-card p-6 relative flex flex-col">
          <div className="absolute top-0 left-0 h-[2px] w-full bg-gradient-to-r from-primary/40 to-transparent" />
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-xl text-aegean">📝 Notas Pessoais</h2>
            <span className={`text-[10px] uppercase tracking-widest transition ${saved ? "text-green-500" : "text-muted-foreground/40"}`}>
              {saved ? "Salvo ✓" : "Digitando…"}
            </span>
          </div>
          <textarea
            value={nota}
            onChange={(e) => handleNotaChange(e.target.value)}
            placeholder={`Escreve aqui os teus pensamentos sobre "${book.title}".\n\nCitas, reflexões, o que mudou em ti ao ler este livro — tudo cabe aqui.`}
            className="w-full flex-1 border border-border bg-background p-5 text-base md:text-lg text-foreground leading-relaxed outline-none focus:border-gold placeholder:italic placeholder:text-muted-foreground/50 resize-y rounded-[2px]"
            style={{ minHeight: "500px" }}
          />
          <p className="mt-2 text-[10px] text-muted-foreground">As notas são salvas automaticamente neste dispositivo.</p>
        </div>

        {/* Frases & Aforismos */}
        <div className="border border-gold/30 bg-card p-6 relative flex flex-col">
          <div className="absolute top-0 left-0 h-[2px] w-full bg-gradient-to-r from-gold/60 to-transparent" />
          <h2 className="font-display text-xl text-aegean mb-4">✦ Aforismos & Frases</h2>

          {frases.length === 0 ? (
            <div className="flex-1 flex items-center justify-center">
              <p className="text-base italic text-muted-foreground text-center px-4">
                Nenhuma frase fixada ainda. Registra abaixo os trechos que te marcaram.
              </p>
            </div>
          ) : (
            <ul className="flex-1 space-y-4 overflow-y-auto mb-4 max-h-[500px] pr-2 scrollbar-thin scrollbar-thumb-gold/20">
              {frases.map((f) => (
                <li
                  key={f.id}
                  className="group relative bg-muted/20 border border-border/50 p-5 hover:border-gold/40 transition rounded-[2px]"
                >
                  <span className="font-display text-gold text-3xl leading-none absolute top-4 left-4 select-none">"</span>
                  <p className="font-serif text-base md:text-lg italic text-foreground/90 leading-relaxed pl-8 break-words whitespace-pre-line">
                    {f.text}
                  </p>
                  <button
                    onClick={() => removeFrase(f.id)}
                    className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 text-xs text-muted-foreground hover:text-terracotta transition-opacity"
                    title="Remover frase"
                  >
                    ✕
                  </button>
                </li>
              ))}
            </ul>
          )}

          <form onSubmit={handleAddFrase} className="mt-auto flex flex-col gap-3 border-t border-border/40 pt-4">
            <textarea
              value={newFraseText}
              onChange={(e) => setNewFraseText(e.target.value)}
              placeholder="Fixa aqui uma frase marcante desta leitura…"
              rows={4}
              className="w-full border border-border bg-background p-4 text-base md:text-lg text-foreground outline-none focus:border-gold placeholder:italic rounded-[2px] resize-y"
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleAddFrase(e);
                }
              }}
            />
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-muted-foreground">Enter para fixar · Shift+Enter nova linha</span>
              <button
                type="submit"
                disabled={!newFraseText.trim()}
                className="border border-gold bg-gold/10 px-6 py-2 text-[10px] uppercase tracking-widest text-gold hover:bg-gold/20 disabled:opacity-40 disabled:pointer-events-none rounded-[2px] font-bold transition"
              >
                Fixar
              </button>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
}
