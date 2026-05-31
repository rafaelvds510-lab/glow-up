import { Link, useRouterState } from "@tanstack/react-router";
import { useState, useEffect, useRef } from "react";
import { ColumnLogo } from "./Ornaments";
import { loadIdentidade, savePortrait, Portrait } from "@/lib/identidade";

const nav = [
  { to: "/dashboard", label: "Dashboard" },
  { to: "/habitos", label: "Hábitos" },
  { to: "/libertacao", label: "Libertação" },
  { to: "/aura", label: "Aura" },
  { to: "/biblioteca", label: "Biblioteca" },
] as const;

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [portrait, setPortrait] = useState<Portrait | null>(() => {
    if (typeof window === "undefined") return null;
    try {
      return loadIdentidade().portrait;
    } catch {
      return null;
    }
  });
  const [installPrompt, setInstallPrompt] = useState<Event | null>(null);
  const router = useRouterState();

  useEffect(() => {
    const sync = () => setPortrait(loadIdentidade().portrait);
    sync();
    window.addEventListener("identidade:update", sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener("identidade:update", sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  // PWA Install Prompt
  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setInstallPrompt(e);
      (window as any).deferredInstallPrompt = e;
    };
    const installed = () => setInstallPrompt(null);
    window.addEventListener("beforeinstallprompt", handler);
    window.addEventListener("appinstalled", installed);
    return () => {
      window.removeEventListener("beforeinstallprompt", handler);
      window.removeEventListener("appinstalled", installed);
    };
  }, []);

  const handleInstall = async () => {
    if (!installPrompt) return;
    (installPrompt as any).prompt();
    const { outcome } = await (installPrompt as any).userChoice;
    if (outcome === "accepted") setInstallPrompt(null);
  };

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      if (ev.target?.result) {
        savePortrait({ foto: ev.target.result as string });
      }
    };
    reader.readAsDataURL(file);
  };

  const handleRestart = () => {
    if (confirm("ATENÇÃO: O Purgatório apagará permanentemente todos os registros de hábitos e vícios. Seu progresso retornará ao pó. Deseja realmente prosseguir?")) {
      localStorage.removeItem("santuario.habitos.v1");
      localStorage.removeItem("santuario.habitos.groups.v1");
      localStorage.removeItem("santuario.vicios.v1");
      window.location.reload();
    }
  };

  const handleLogout = async () => {
    // Limpa estado local
    localStorage.removeItem("santuario.auth");
    localStorage.removeItem("santuario.email");
    localStorage.removeItem("santuario.contas");
    
    const SYNC_KEYS = [
      "santuario.identidade.v1",
      "santuario.habitos.v1",
      "santuario.habitos.groups.v1",
      "santuario.vicios.v1",
      "santuario.leituras.v1",
      "santuario.frases.v1",
      "santuario.biblioteca.v1",
      "santuario.ascensao.v1"
    ];
    SYNC_KEYS.forEach(k => localStorage.removeItem(k));

    // Desloga do Supabase
    try {
      const { supabase } = await import('@/integrations/supabase/client');
      await supabase.auth.signOut();
    } catch(e) {}
    
    window.location.reload();
  };

  // Fecha menu ao navegar
  useEffect(() => { setOpen(false); }, [router.location.pathname]);

  // Fecha menu se a janela for redimensionada para desktop (md: 768px)
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) setOpen(false);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Bloqueia scroll do body quando menu aberto de forma segura
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  const linkClass = "text-foreground/70 transition-colors hover:text-foreground";
  const activeCls = "text-foreground font-medium";

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-border/60 bg-background/85 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 md:px-6">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 text-aegean flex-shrink-0" onClick={() => setOpen(false)}>
            <ColumnLogo className="h-8 w-7 text-gold" />
            <div className="leading-tight">
              <div className="font-display text-lg">Santuário</div>
              <div className="label-eyebrow !text-[0.6rem]">do glow-up</div>
            </div>
          </Link>

          {/* Right Section: Nav, Profile & Hamburger */}
          <div className="flex items-center gap-6 ml-auto z-50">
            {/* Nav desktop */}
            <nav className="hidden items-center gap-7 text-sm md:flex mr-2">
              {nav.map((n) => (
                <Link
                  key={n.to}
                  to={n.to}
                  className={linkClass}
                  activeProps={{ className: activeCls }}
                >
                  {n.label}
                </Link>
              ))}
            </nav>



            {/* Perfil Button */}
            <button
              onClick={() => setProfileOpen(true)}
              className="h-10 w-10 rounded-full overflow-hidden border border-border/60 hover:border-primary transition shrink-0"
              title="Perfil"
            >
              {portrait?.foto ? (
                <img src={portrait.foto} alt="Perfil" className="h-full w-full object-cover" />
              ) : (
                <div className="h-full w-full bg-muted/40 flex items-center justify-center text-muted-foreground text-sm">
                  👤
                </div>
              )}
            </button>

            {/* Botão hambúrguer mobile */}
            <button
              id="mobile-menu-toggle"
              aria-label="Abrir menu"
              aria-expanded={open}
              onClick={() => setOpen((v) => !v)}
              className="flex h-[44px] w-[44px] flex-col items-end justify-center gap-[6px] md:hidden shrink-0"
            >
              <span
                className="block h-[2px] w-6 bg-foreground transition-all duration-300"
                style={open ? { transform: "translateY(7px) rotate(45deg)" } : {}}
              />
              <span
                className="block h-[2px] w-6 bg-foreground transition-all duration-300"
                style={open ? { opacity: 0 } : {}}
              />
              <span
                className="block h-[2px] w-6 bg-foreground transition-all duration-300"
                style={open ? { transform: "translateY(-7px) rotate(-45deg)" } : {}}
              />
            </button>
          </div>
        </div>
      </header>

      {/* Drawer mobile */}
      {open && (
        <div
          id="mobile-menu-overlay"
          className="fixed inset-0 z-30 bg-black/50 md:hidden"
          onClick={() => setOpen(false)}
          aria-hidden="true"
        />
      )}
      <nav
        id="mobile-menu"
        aria-label="Navegação mobile"
        className={`fixed top-0 right-0 z-40 h-full w-72 max-w-[85vw] bg-card border-l border-border flex flex-col pt-20 pb-8 px-6 gap-2 transition-transform duration-300 md:hidden ${open ? "translate-x-0" : "translate-x-full"}`}
      >
        <p className="label-eyebrow mb-4">Navegação</p>
        {nav.map((n) => (
          <Link
            key={n.to}
            to={n.to}
            onClick={() => setOpen(false)}
            className="font-display text-2xl text-foreground/70 py-3 border-b border-border/40 hover:text-primary transition-colors"
            activeProps={{ className: "font-display text-2xl text-primary py-3 border-b border-border/40" }}
          >
            {n.label}
          </Link>
        ))}


      </nav>

      {/* Modal de Perfil */}
      {profileOpen && portrait && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-sm border border-border bg-card p-6 shadow-xl relative">
            <button onClick={() => setProfileOpen(false)} className="absolute top-4 right-4 text-muted-foreground hover:text-foreground">✕</button>
            
            <h3 className="font-display text-2xl text-aegean uppercase tracking-widest text-center mb-6">Identidade</h3>
            
            <div className="flex flex-col items-center gap-4">
              <div 
                className="h-24 w-24 rounded-full overflow-hidden border-2 border-gold/40 cursor-pointer hover:opacity-80 transition relative group"
                onClick={() => fileInputRef.current?.click()}
              >
                {portrait.foto ? (
                  <img src={portrait.foto} alt="Perfil" className="h-full w-full object-cover" />
                ) : (
                  <div className="h-full w-full bg-muted/30 flex items-center justify-center text-3xl">👤</div>
                )}
                <div className="absolute inset-0 bg-black/50 hidden group-hover:flex items-center justify-center text-xs text-white uppercase tracking-widest">
                  Trocar
                </div>
              </div>
              <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handlePhotoUpload} />

              <div className="w-full space-y-4 mt-2">
                <div>
                  <label className="block text-xs uppercase tracking-widest text-muted-foreground mb-1">Nome</label>
                  <input 
                    type="text" 
                    value={portrait.nome} 
                    onChange={(e) => savePortrait({ nome: e.target.value })}
                    className="w-full bg-transparent border-b border-border py-2 text-foreground focus:outline-none focus:border-primary transition"
                    placeholder="Como deseja ser chamado?"
                  />
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-widest text-muted-foreground mb-1">Idade</label>
                  <input 
                    type="number" 
                    value={portrait.idade} 
                    onChange={(e) => savePortrait({ idade: e.target.value })}
                    className="w-full bg-transparent border-b border-border py-2 text-foreground focus:outline-none focus:border-primary transition"
                    placeholder="Sua idade atual"
                  />
                </div>
              </div>

              <div className="w-full mt-8 pt-6 border-t border-border/40 space-y-3">
                {installPrompt && (
                  <button 
                    onClick={() => { handleInstall(); setProfileOpen(false); }}
                    className="w-full py-3 bg-primary hover:bg-primary/95 text-primary-foreground text-sm uppercase tracking-widest font-bold transition flex items-center justify-center gap-2"
                  >
                    <span>↓</span> Instalar Aplicativo
                  </button>
                )}
                <button 
                  onClick={handleRestart}
                  className="w-full py-3 border border-destructive/30 text-destructive text-sm uppercase tracking-widest font-bold hover:bg-destructive hover:text-marble transition"
                >
                  Purgatório (Zerar Contagens)
                </button>
                <button 
                  onClick={handleLogout}
                  className="w-full py-3 bg-secondary hover:bg-secondary/80 text-foreground text-sm uppercase tracking-widest font-bold transition"
                >
                  Sair da Conta
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
