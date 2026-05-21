// Gerenciador de Frases dos Livros e Pensamentos do Site/Mentor

export type FraseBook = {
  id: string;
  bookKey: string;
  bookTitle: string;
  bookAuthor: string;
  text: string;
  createdAt: string;
};

const STORAGE_KEY = "santuario.frases.v1";

// Pensamentos padrão para quando o usuário não tiver frases cadastradas
export const DEFAULT_PENSAMENTOS = [
  {
    text: "A vida sem prazer é uma morte adiada — mas o prazer sem método é ruína.",
    author: "Giacomo Casanova",
    source: "História da Minha Vida"
  },
  {
    text: "Quem não sabe ocultar os seus pensamentos, não sabe reinar.",
    author: "Giacomo Casanova",
    source: "Aforismos Venezianos"
  },
  {
    text: "A sorte protege os audazes, mas a inteligência protege os audazes com método.",
    author: "Giacomo Casanova",
    source: "Aforismos Venezianos"
  },
  {
    text: "O homem que se domina é mais forte que o que conquista cidades.",
    author: "Sêneca",
    source: "Cartas a Lucílio"
  },
  {
    text: "A melhor vingança é ser diferente daquele que causou a ferida.",
    author: "Marco Aurélio",
    source: "Meditações"
  },
  {
    text: "A beleza e a pose são as primeiras cartas de apresentação; o verbo conclui a conquista.",
    author: "Giacomo Casanova",
    source: "História da Minha Vida"
  },
  {
    text: "A paciência é o refúgio das grandes mentes; a impaciência é a ruína do porte.",
    author: "Sêneca",
    source: "Cartas a Lucílio"
  }
];

export function loadFrases(): FraseBook[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveFrases(list: FraseBook[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    window.dispatchEvent(new CustomEvent("frases:update"));
  } catch {}
}

export function addFrase(bookTitle: string, bookAuthor: string, text: string): FraseBook | null {
  const trimmed = text.trim();
  if (!trimmed) return null;

  const key = `${bookTitle}::${bookAuthor}`.toLowerCase();
  const list = loadFrases();
  
  const novaFrase: FraseBook = {
    id: Math.random().toString(36).slice(2, 10),
    bookKey: key,
    bookTitle,
    bookAuthor,
    text: trimmed,
    createdAt: new Date().toISOString()
  };

  const next = [novaFrase, ...list];
  saveFrases(next);
  return novaFrase;
}

export function removeFrase(id: string): FraseBook[] {
  const list = loadFrases();
  const next = list.filter(f => f.id !== id);
  saveFrases(next);
  return next;
}

export function getFrasesByBook(bookTitle: string, bookAuthor: string): FraseBook[] {
  const key = `${bookTitle}::${bookAuthor}`.toLowerCase();
  return loadFrases().filter(f => f.bookKey === key);
}

// Retorna uma frase aleatória (ou do usuário se existirem, ou do pool padrão)
export function getRandomPensamento(): { text: string; author: string; source: string } {
  const userFrases = loadFrases();
  
  if (userFrases.length > 0) {
    // 50% de chance de mostrar uma frase do usuário se ele tiver frases fixadas,
    // garantindo dinamismo e misturando com os pensamentos de Casanova/Antigos!
    if (Math.random() > 0.4) {
      const idx = Math.floor(Math.random() * userFrases.length);
      const f = userFrases[idx];
      return {
        text: f.text,
        author: f.bookAuthor,
        source: f.bookTitle
      };
    }
  }

  // Retorna frase padrão
  const idx = Math.floor(Math.random() * DEFAULT_PENSAMENTOS.length);
  return DEFAULT_PENSAMENTOS[idx];
}
