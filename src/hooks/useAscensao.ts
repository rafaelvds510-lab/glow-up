import { useEffect, useState } from "react";
import { loadState, type AscensaoState, visitPage } from "@/lib/ascensao";

export function useAscensao() {
  const [state, setState] = useState<AscensaoState>(() => loadState());

  useEffect(() => {
    const sync = () => setState(loadState());
    sync();
    window.addEventListener("ascensao:update", sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener("ascensao:update", sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  return { state };
}

export function useVisitPage(path: string) {
  useEffect(() => {
    visitPage(path);
  }, [path]);
}
