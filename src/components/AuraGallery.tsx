import { useState, useEffect, useRef } from "react";

type GalleryItem = {
  id: string;
  name: string;
  imageBase64: string;
  note?: string;
};

export function AuraGallery({ storageKey, title }: { storageKey: string, title: string }) {
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [editing, setEditing] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const [draftName, setDraftName] = useState("");
  const [draftNote, setDraftNote] = useState("");
  const [draftImg, setDraftImg] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(storageKey);
      if (raw) setItems(JSON.parse(raw));
    } catch {}
  }, [storageKey]);

  const saveItems = (newItems: GalleryItem[]) => {
    localStorage.setItem(storageKey, JSON.stringify(newItems));
    setItems(newItems);
  };

  const handleFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d")!;
        const MAX_WIDTH = 400;
        let width = img.width;
        let height = img.height;
        
        if (width > MAX_WIDTH) {
          height = Math.round((height * MAX_WIDTH) / width);
          width = MAX_WIDTH;
        }
        canvas.width = width;
        canvas.height = height;
        ctx.drawImage(img, 0, 0, width, height);
        setDraftImg(canvas.toDataURL("image/jpeg", 0.7));
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const onAdd = () => {
    if (!draftName || !draftImg) return;
    
    if (editingId) {
      const updated = items.map(i => i.id === editingId ? { ...i, name: draftName, imageBase64: draftImg, note: draftNote } : i);
      saveItems(updated);
    } else {
      const newItem: GalleryItem = {
        id: Math.random().toString(36).substring(2),
        name: draftName,
        imageBase64: draftImg,
        note: draftNote
      };
      saveItems([newItem, ...items]);
    }
    cancelEdit();
  };

  const cancelEdit = () => {
    setDraftName("");
    setDraftNote("");
    setDraftImg("");
    setEditingId(null);
    setEditing(false);
  };

  const startEdit = (item: GalleryItem) => {
    setDraftName(item.name);
    setDraftNote(item.note || "");
    setDraftImg(item.imageBase64);
    setEditingId(item.id);
    setEditing(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const onRemove = (id: string) => {
    saveItems(items.filter(i => i.id !== id));
  };

  return (
    <section className="mx-auto max-w-5xl px-6 py-12">
      <div className="flex items-center justify-between mb-8 border-b border-border pb-4">
        <h3 className="font-display text-3xl text-primary">{title}</h3>
        <button
          onClick={() => editing ? cancelEdit() : setEditing(true)}
          className="px-4 py-2 bg-primary/10 text-primary text-xs uppercase tracking-widest hover:bg-primary/20 transition-colors"
        >
          {editing ? "Cancelar" : "Adicionar Item"}
        </button>
      </div>

      {editing && (
        <div className="border border-primary/50 bg-card p-6 mb-10">
          <p className="label-eyebrow mb-4">{editingId ? "Editar registro" : "Novo registro na biblioteca"}</p>
          <div className="grid grid-cols-1 md:grid-cols-[200px_1fr] gap-6">
            <div 
              className="h-48 border-2 border-dashed border-border flex items-center justify-center cursor-pointer hover:bg-muted/30 transition-colors bg-cover bg-center"
              style={{ backgroundImage: draftImg ? `url(${draftImg})` : 'none' }}
              onClick={() => fileInputRef.current?.click()}
            >
              {!draftImg && <span className="text-sm text-muted-foreground uppercase tracking-widest text-center">Tocar para<br/>Foto</span>}
              <input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                accept="image/*" 
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) handleFile(e.target.files[0]);
                }}
              />
            </div>
            <div className="flex flex-col gap-4">
              <input
                placeholder="Nome do item..."
                value={draftName}
                onChange={e => setDraftName(e.target.value)}
                className="border border-border bg-background px-4 py-3 text-lg outline-none focus:border-primary"
              />
              <textarea
                placeholder="Notas, ocasião ideal, preço..."
                value={draftNote}
                onChange={e => setDraftNote(e.target.value)}
                className="border border-border bg-background px-4 py-3 flex-1 resize-none outline-none focus:border-primary"
              />
              <button
                onClick={onAdd}
                disabled={!draftImg || !draftName}
                className="self-end px-8 py-3 bg-primary text-primary-foreground text-xs uppercase tracking-widest hover:opacity-90 disabled:opacity-50"
              >
                Salvar no Acervo
              </button>
            </div>
          </div>
        </div>
      )}

      {items.length === 0 ? (
        <div className="text-center py-16 border border-dashed border-border">
          <p className="italic text-muted-foreground">O teu acervo está vazio.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {items.map(item => (
            <div key={item.id} className="border border-border bg-card overflow-hidden group">
              <div 
                className="h-64 bg-cover bg-center relative"
                style={{ backgroundImage: `url(${item.imageBase64})` }}
              >
                <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-3">
                  <button 
                    onClick={() => startEdit(item)}
                    className="text-white border border-white px-6 py-2 text-xs uppercase tracking-widest hover:bg-white hover:text-black transition-colors w-28"
                  >
                    Editar
                  </button>
                  <button 
                    onClick={() => onRemove(item.id)}
                    className="text-white border border-white px-6 py-2 text-xs uppercase tracking-widest hover:bg-red-500 hover:border-red-500 transition-colors w-28"
                  >
                    Excluir
                  </button>
                </div>
              </div>
              <div className="p-4">
                <h4 className="font-display text-xl text-foreground mb-1">{item.name}</h4>
                {item.note && <p className="text-sm text-muted-foreground opacity-80">{item.note}</p>}
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
