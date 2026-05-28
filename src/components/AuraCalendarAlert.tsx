import { useState, useEffect } from "react";

type AlertItem = {
  id: string;
  title: string;
  description: string;
  lastDone: string; // YYYY-MM-DD
  frequencyDays: number;
};

export function AuraCalendarAlert({ storageKey, title, defaultFrequency = 30 }: { storageKey: string, title: string, defaultFrequency?: number }) {
  const [items, setItems] = useState<AlertItem[]>(() => {
    if (typeof window === "undefined") return [];
    try {
      const raw = localStorage.getItem(storageKey);
      if (raw) {
        const parsed = JSON.parse(raw);
        // Migration from old single object format to array format
        if (!Array.isArray(parsed) && parsed.lastDone) {
          return [{
            id: 'legacy',
            title: title,
            description: '',
            lastDone: parsed.lastDone,
            frequencyDays: parsed.frequencyDays
          }];
        } else if (Array.isArray(parsed)) {
          return parsed;
        }
      }
    } catch {}
    return [];
  });
  const [editing, setEditing] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const todayStr = new Date().toISOString().slice(0, 10);

  const [draftTitle, setDraftTitle] = useState("");
  const [draftDesc, setDraftDesc] = useState("");
  const [draftDate, setDraftDate] = useState(todayStr);
  const [draftFreq, setDraftFreq] = useState(defaultFrequency);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(storageKey);
      if (raw) {
        const parsed = JSON.parse(raw);
        // Migration from old single object format to array format
        if (!Array.isArray(parsed) && parsed.lastDone) {
          const migrated: AlertItem = {
            id: 'legacy',
            title: title,
            description: '',
            lastDone: parsed.lastDone,
            frequencyDays: parsed.frequencyDays
          };
          setItems([migrated]);
        } else if (Array.isArray(parsed)) {
          setItems(parsed);
        }
      }
    } catch {}
  }, [storageKey, title]);

  const saveItems = (newItems: AlertItem[]) => {
    localStorage.setItem(storageKey, JSON.stringify(newItems));
    setItems(newItems);
  };

  const onAddOrUpdate = () => {
    if (!draftTitle) return;

    if (editingId) {
      const updated = items.map(i => i.id === editingId ? {
        ...i,
        title: draftTitle,
        description: draftDesc,
        lastDone: draftDate,
        frequencyDays: draftFreq
      } : i);
      saveItems(updated);
    } else {
      const newItem: AlertItem = {
        id: Math.random().toString(36).substring(2),
        title: draftTitle,
        description: draftDesc,
        lastDone: draftDate,
        frequencyDays: draftFreq
      };
      saveItems([...items, newItem]);
    }
    cancelEdit();
  };

  const cancelEdit = () => {
    setDraftTitle("");
    setDraftDesc("");
    setDraftDate(todayStr);
    setDraftFreq(defaultFrequency);
    setEditingId(null);
    setEditing(false);
  };

  const startEdit = (item: AlertItem) => {
    setDraftTitle(item.title);
    setDraftDesc(item.description);
    setDraftDate(item.lastDone);
    setDraftFreq(item.frequencyDays);
    setEditingId(item.id);
    setEditing(true);
  };

  const onRemove = (id: string) => {
    saveItems(items.filter(i => i.id !== id));
  };

  const markToday = (id: string) => {
    const updated = items.map(i => i.id === id ? { ...i, lastDone: todayStr } : i);
    saveItems(updated);
  };

  const getStatus = (item: AlertItem) => {
    const lastD = new Date(item.lastDone);
    const today = new Date(todayStr);
    const diffTime = today.getTime() - lastD.getTime();
    const passedDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    const daysDiff = item.frequencyDays - passedDays;
    
    if (daysDiff < 0) {
      return { class: "border-destructive/50 bg-destructive/10 text-destructive", text: `Atrasado há ${Math.abs(daysDiff)} dias` };
    } else if (daysDiff <= 3) {
      return { class: "border-gold/50 bg-gold/10 text-gold", text: `Atenção: faltam ${daysDiff} dias` };
    } else {
      return { class: "border-primary/50 bg-primary/10 text-primary", text: `Tudo em ordem (faltam ${daysDiff} dias)` };
    }
  };

  return (
    <section className="mx-auto max-w-5xl px-6 py-12">
      <div className="flex items-center justify-between mb-8 border-b border-border pb-4">
        <h3 className="font-display text-3xl text-primary">{title}</h3>
        <button
          onClick={() => editing ? cancelEdit() : setEditing(true)}
          className="px-4 py-2 bg-primary/10 text-primary text-xs uppercase tracking-widest hover:bg-primary/20 transition-colors"
        >
          {editing ? "Cancelar" : "Adicionar Alerta"}
        </button>
      </div>

      {editing && (
        <div className="border border-primary/50 bg-card p-6 mb-10">
          <p className="label-eyebrow mb-4">{editingId ? "Editar alerta" : "Novo alerta"}</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-[10px] uppercase opacity-70">Título da Manutenção</label>
              <input
                placeholder="Ex: Corte de Cabelo"
                value={draftTitle}
                onChange={e => setDraftTitle(e.target.value)}
                className="border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-[10px] uppercase opacity-70">Descrição (opcional)</label>
              <input
                placeholder="Ex: Degrade navalhado, pente 3"
                value={draftDesc}
                onChange={e => setDraftDesc(e.target.value)}
                className="border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-[10px] uppercase opacity-70">Última vez feito</label>
              <input 
                type="date" 
                value={draftDate} 
                onChange={e => setDraftDate(e.target.value)}
                className="border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-[10px] uppercase opacity-70">Frequência (dias)</label>
              <input 
                type="number" 
                min="1"
                value={draftFreq} 
                onChange={e => setDraftFreq(Number(e.target.value))}
                className="border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
              />
            </div>
          </div>
          <div className="mt-6 flex justify-end">
            <button
              onClick={onAddOrUpdate}
              disabled={!draftTitle}
              className="px-8 py-3 bg-primary text-primary-foreground text-xs uppercase tracking-widest hover:opacity-90 disabled:opacity-50"
            >
              Salvar Alerta
            </button>
          </div>
        </div>
      )}

      {items.length === 0 ? (
        <div className="text-center py-16 border border-dashed border-border">
          <p className="italic text-muted-foreground">Nenhum alerta configurado.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map(item => {
            const status = getStatus(item);
            return (
              <div key={item.id} className={`border p-6 transition-colors group relative ${status.class}`}>
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                  <button onClick={() => startEdit(item)} className="text-xs uppercase hover:underline">Editar</button>
                  <button onClick={() => onRemove(item.id)} className="text-xs uppercase hover:underline">Excluir</button>
                </div>
                
                <h4 className="font-display text-xl mb-1 mt-2">{item.title}</h4>
                {item.description && <p className="text-xs opacity-80 mb-2">{item.description}</p>}
                
                <p className="text-sm font-medium mt-4">{status.text}</p>
                <p className="text-xs opacity-70 mt-1">Última: {item.lastDone.split('-').reverse().join('/')} (A cada {item.frequencyDays} dias)</p>

                <div className="mt-6">
                  <button
                    onClick={() => markToday(item.id)}
                    className="w-full px-4 py-2 border border-current text-xs uppercase tracking-widest hover:opacity-70 transition-opacity"
                  >
                    Registrar Hoje
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
