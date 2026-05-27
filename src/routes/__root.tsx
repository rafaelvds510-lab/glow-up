import { Outlet, Link, createRootRoute, HeadContent, Scripts } from "@tanstack/react-router";
import { useState, useEffect } from "react";

import appCss from "../styles.css?url";

// Google "G" SVG icon inline (sem dependências extras)
function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
      <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
      <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
      <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
      <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.18 1.48-4.97 2.36-8.16 2.36-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
      <path fill="none" d="M0 0h48v48H0z"/>
    </svg>
  );
}

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1, viewport-fit=cover" },
      { title: "Santuário do Glow-up Masculino" },
      { name: "description", content: "Transformação integral: estética e aura. Um santuário clássico para a evolução masculina." },
      { property: "og:title", content: "Santuário do Glow-up" },
      { property: "og:description", content: "Transformação integral: estética e aura. Um santuário clássico para a evolução masculina." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "Santuário do Glow-up" },
      { name: "twitter:description", content: "Transformação integral: estética e aura. Um santuário clássico para a evolução masculina." },
      { property: "og:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/d7481168-54b4-40cd-9a0a-e8ee0560e392/id-preview-495028e1--491921bb-ab77-4f98-8221-88560d60002b.lovable.app-1778214437388.png" },
      { name: "twitter:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/d7481168-54b4-40cd-9a0a-e8ee0560e392/id-preview-495028e1--491921bb-ab77-4f98-8221-88560d60002b.lovable.app-1778214437388.png" },
      // PWA / Mobile
      { name: "theme-color", content: "#13293D" },
      { name: "apple-mobile-web-app-capable", content: "yes" },
      { name: "apple-mobile-web-app-status-bar-style", content: "black-translucent" },
      { name: "apple-mobile-web-app-title", content: "Santuário" },
      { name: "mobile-web-app-capable", content: "yes" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,400&family=Inter:wght@300;400;500;600&display=swap",
      },
      { rel: "manifest", href: "/manifest.json" },
      { rel: "apple-touch-icon", href: "/icons/icon-192.png" },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
});

function RootShell({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {});
    }
  }, []);

  return (
    <html lang="pt-BR">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

import { supabase } from "@/integrations/supabase/client";
import { setupAutoSync, pullSyncData, pushSyncData } from "@/lib/sync";

function RootComponent() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(true);
  const [googleLoading, setGoogleLoading] = useState(false);

  // Inicializa a sessão e a sincronização
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setIsAuthenticated(true);
        localStorage.setItem("santuario.auth", "true");
        if (localStorage.getItem("santuario.dirty") === "true") {
          pushSyncData().then(() => setLoading(false));
        } else {
          // Ao iniciar, puxa os dados mais recentes da nuvem
          pullSyncData().then(() => setLoading(false));
        }
      } else {
        // Se ainda tiver o login antigo local, força deslogar
        if (localStorage.getItem("santuario.auth") === "true") {
          localStorage.removeItem("santuario.auth");
        }
        setIsAuthenticated(false);
        setLoading(false);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_IN" && session) {
        // Cobre o callback do OAuth do Google
        setIsAuthenticated(true);
        localStorage.setItem("santuario.auth", "true");
        if (localStorage.getItem("santuario.dirty") === "true") {
          pushSyncData().catch(() => {}).finally(() => setLoading(false));
        } else {
          pullSyncData().catch(() => {}).finally(() => setLoading(false));
        }
      } else if (event === "SIGNED_OUT") {
        setIsAuthenticated(false);
      }
    });

    // Inicia o auto-sync em background
    const cleanupSync = setupAutoSync();

    return () => {
      subscription.unsubscribe();
      if (cleanupSync) cleanupSync();
    };
  }, []);

  const handleGoogleLogin = async () => {
    setGoogleLoading(true);
    setError("");
    try {
      const { error: authError } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: window.location.origin,
        },
      });
      if (authError) {
        setError(authError.message);
        setGoogleLoading(false);
      }
      // Se sucesso, o browser redireciona para o Google — não precisamos setar loading=false aqui
    } catch (err: any) {
      setError(err.message || "Erro ao conectar com o Google.");
      setGoogleLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const emailTrimmed = email.trim().toLowerCase();
    
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailTrimmed)) {
      setError("Insira um e-mail válido.");
      return;
    }
    if (password.length < 6) {
      setError("A senha deve ter pelo menos 6 caracteres.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      if (isSignUp) {
        // Usa o Supabase para criar a conta
        const { error: authError } = await supabase.auth.signUp({
          email: emailTrimmed,
          password: password,
        });

        if (authError) throw authError;
        
        // Ao criar a conta nova, sobe os dados locais que o usuário já tinha
        await pushSyncData();
        
      } else {
        // Usa o Supabase para logar
        const { error: authError } = await supabase.auth.signInWithPassword({
          email: emailTrimmed,
          password: password,
        });

        if (authError) throw authError;

        // Ao logar, baixa os dados da nuvem para o celular atual
        await pullSyncData();
      }
    } catch (err: any) {
      setError(err.message || "Ocorreu um erro na autenticação.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <p className="text-muted-foreground uppercase tracking-widest text-sm animate-pulse">Sincronizando o Santuário...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-4">
        <form onSubmit={handleLogin} className="w-full max-w-sm border border-border bg-card p-8 shadow-lg" id="login-form">
          <div className="text-center">
            <h1 className="font-display text-4xl text-primary">Santuário</h1>
            <p className="mt-2 text-sm uppercase tracking-widest text-muted-foreground">
              {isSignUp ? "Criar Perfil na Nuvem" : "Acesso Restrito"}
            </p>
          </div>
          {/* Botão Google OAuth */}
          <button
            id="google-login-btn"
            type="button"
            onClick={handleGoogleLogin}
            disabled={googleLoading}
            className="mt-6 w-full flex items-center justify-center gap-3 border border-border bg-white hover:bg-gray-50 text-gray-700 px-4 py-3 text-sm font-medium transition disabled:opacity-50 shadow-sm"
          >
            {googleLoading ? (
              <span className="h-4 w-4 rounded-full border-2 border-gray-400 border-t-transparent animate-spin" />
            ) : (
              <GoogleIcon />
            )}
            {googleLoading ? "Redirecionando..." : "Entrar com Google"}
          </button>

          {/* Divisor */}
          <div className="mt-5 flex items-center gap-3">
            <div className="flex-1 h-px bg-border" />
            <span className="text-xs uppercase tracking-widest text-muted-foreground">ou</span>
            <div className="flex-1 h-px bg-border" />
          </div>

          <div className="mt-4 flex flex-col gap-4">
            <div>
              <label htmlFor="login-email" className="block text-xs uppercase tracking-widest text-muted-foreground mb-1">E-mail</label>
              <input
                id="login-email"
                type="email"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setError(""); }}
                placeholder="seu@email.com"
                autoComplete="email"
                className="w-full border border-border bg-background px-4 py-3 text-foreground outline-none transition focus:border-primary"
                required
              />
            </div>
            <div className="relative">
              <label htmlFor="login-password" className="block text-xs uppercase tracking-widest text-muted-foreground mb-1">Senha</label>
              <input
                id="login-password"
                type={showPass ? "text" : "password"}
                value={password}
                onChange={(e) => { setPassword(e.target.value); setError(""); }}
                placeholder="••••••••"
                autoComplete="current-password"
                className="w-full border border-border bg-background px-4 py-3 pr-12 text-foreground outline-none transition focus:border-primary"
                required
              />
              <button
                type="button"
                id="toggle-password-visibility"
                onClick={() => setShowPass(v => !v)}
                className="absolute right-3 bottom-3 text-muted-foreground hover:text-primary text-xs uppercase tracking-widest transition"
                aria-label="Mostrar ou ocultar senha"
              >
                {showPass ? "Ocultar" : "Ver"}
              </button>
            </div>
            {error && <p className="text-xs text-destructive">{error}</p>}
          </div>
          <button
            id="login-submit"
            type="submit"
            disabled={loading}
            className="mt-6 w-full bg-primary px-4 py-3 text-sm uppercase tracking-widest text-primary-foreground transition hover:bg-primary/90 disabled:opacity-50"
          >
            {isSignUp ? "Criar Perfil" : "Entrar"}
          </button>
          <div className="mt-4 text-center">
            <button
              type="button"
              onClick={() => {
                setIsSignUp(!isSignUp);
                setError("");
              }}
              className="text-xs uppercase tracking-widest text-muted-foreground hover:text-primary transition font-medium"
            >
              {isSignUp ? "Já tenho um perfil. Entrar" : "Não tenho perfil. Criar um perfil"}
            </button>
          </div>
        </form>
      </div>
    );
  }

  return <Outlet />;
}
