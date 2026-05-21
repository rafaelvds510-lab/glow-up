## Santuário do Glow-up Masculino

Site editorial inspirado em estética greco-romana clássica — mármore, ouro, terracota e azul Egeu — para guiar a transformação masculina integral.

### Direção visual

- **Paleta (tokens em `src/styles.css`, oklch):**
  - `--marble` off-white quente (fundo principal)
  - `--gold` dourado fosco (acentos, filetes, ícones)
  - `--terracotta` terracota (CTAs, destaques quentes)
  - `--aegean` azul Egeu profundo (texto forte, seções escuras)
- **Tipografia:** Cormorant Garamond (display, serifa clássica) + Inter (corpo, sans moderna). Pequenos labels em letterspaced uppercase.
- **Linguagem gráfica:** filetes finos em ouro, capitulares, numerais romanos para seções, divisórias com folha de louros, leve textura de papel/mármore, cantos quadrados, generosa respiração.
- **Logo/ícones (SVG inline):** coluna dórica estilizada como marca principal, folha de louros e coruja como ícones recorrentes dos pilares e seções.

### Arquitetura de rotas (TanStack Start, cada rota com `head()` próprio)

```text
/                  Home — manifesto, três pilares, prévia do Mentor IA, CTA
/aura              Pilar Estética — pele, cabelo, estilo
/verbo             Pilar Comunicação — voz, presença, dinâmica social
/estrategia       Pilar Psicologia — frameworks e casos reais
/mentor            Mentor IA Giacomo Casanova (apresentação + chat placeholder)
/habitos           Checklist de hábitos diários
/biblioteca        Curadoria literária (clássicos + modernos)
```

### Conteúdo por página

- **Home:** hero com coluna dórica + manifesto curto, três cards de pilares (Aura/Verbo/Estratégia), bloco do Mentor IA, prévia de hábitos, prévia da biblioteca, rodapé com louros.
- **Aura / Verbo / Estratégia:** intro filosófica, 3–5 princípios numerados em romanos, rituais práticos, leitura recomendada do pilar.
- **Mentor:** retrato/silhueta de Casanova, tom de voz do mentor, exemplo de diálogo, formulário de mensagem (UI apenas — sem backend nesta etapa).
- **Hábitos:** checklist diário interativo (estado local) agrupado por pilar, barra de progresso em ouro.
- **Biblioteca:** grid de livros (clássicos: Plutarco, Marco Aurélio, Ovídio; modernos: Robert Greene, etc.) com capa estilizada tipográfica, sinopse curta e pilar associado.

### Componentes compartilhados

- `SiteHeader` com nav (Link do TanStack), logo coluna dórica
- `SiteFooter` com louros e citação
- `PillarCard`, `PrincipleList` (numerais romanos), `BookCard`, `HabitItem`
- `OrnamentDivider` (SVG louros/filete dourado)

### Detalhes técnicos

- Tokens semânticos em `src/styles.css` (`--background` = mármore, `--primary` = azul Egeu, `--accent` = ouro, `--secondary` = terracota) + variantes em `@theme inline`.
- Fontes via `<link>` Google Fonts em `__root.tsx` head.
- Substituir o placeholder em `src/routes/index.tsx`.
- `head()` único por rota (title, description, og:title, og:description).
- Sem backend nesta etapa (Mentor IA é UI; hábitos usam `useState` + `localStorage`). Quando quiser chat real ou persistência, ativamos Lovable Cloud em um próximo passo.

### Fora do escopo desta primeira entrega

- Chat funcional com IA, autenticação, persistência em nuvem, pagamentos.

Confirma para eu implementar, ou quer ajustar paleta, rotas ou escopo?