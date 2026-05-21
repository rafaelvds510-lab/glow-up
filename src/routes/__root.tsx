import { Outlet, Link, createRootRoute, HeadContent, Scripts } from "@tanstack/react-router";
import { useState, useEffect } from "react";

import appCss from "../styles.css?url";

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
      { name: "viewport", content: "width=device-width, initial-scale=1" },
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
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,400&family=Inter:wght@300;400;500;600&display=swap",
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
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

function RootComponent() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(true);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    setIsAuthenticated(localStorage.getItem("santuario.auth") === "true");
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === "santuario") {
      localStorage.setItem("santuario.auth", "true");
      setIsAuthenticated(true);
    } else {
      setError("Senha incorreta.");
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-4">
        <form onSubmit={handleLogin} className="w-full max-w-sm border border-border bg-card p-8 shadow-lg">
          <div className="text-center">
            <h1 className="font-display text-4xl text-primary">Santuário</h1>
            <p className="mt-2 text-sm uppercase tracking-widest text-muted-foreground">Acesso restrito</p>
          </div>
          <div className="mt-8">
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Palavra-passe"
              className="w-full border border-border bg-background px-4 py-3 text-foreground outline-none transition focus:border-primary"
            />
            {error && <p className="mt-2 text-xs text-destructive">{error}</p>}
          </div>
          <button
            type="submit"
            className="mt-6 w-full bg-primary px-4 py-3 text-sm uppercase tracking-widest text-primary-foreground transition hover:bg-primary/90"
          >
            Entrar
          </button>
        </form>
      </div>
    );
  }

  return <Outlet />;
}
