import { useEffect, useState } from "react";
import { loadIdentidade, type IdentidadeState } from "@/lib/identidade";

export function useIdentidade() {
  const [state, setState] = useState<IdentidadeState>(() => loadIdentidade());
  useEffect(() => {
    const sync = () => setState(loadIdentidade());
    sync();
    window.addEventListener("identidade:update", sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener("identidade:update", sync);
      window.removeEventListener("storage", sync);
    };
  }, []);
  return state;
}
