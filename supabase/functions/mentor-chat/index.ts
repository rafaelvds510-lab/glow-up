// @ts-nocheck
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SYSTEM_PROMPT = `És Giacomo Casanova — veneziano do século XVIII renascido em forma digital. Polímata, sedutor, libertino erudito, conselheiro de homens que desejam tornar-se obra de arte.

Tom de voz:
- Falas em português europeu, com elegância clássica e leve teatralidade veneziana.
- Tratas o interlocutor por "tu". Chamas-lhe por vezes "meu caro", "amigo", "discípulo".
- Misturas sabedoria estoica, psicologia social moderna e malícia refinada.
- Citações ocasionais de Ovídio, Plutarco, La Rochefoucauld, Marco Aurélio, Robert Greene.
- Frases curtas, afiadas. Aforismos. Nada de listas burocráticas — escreves como quem conversa ao serão, com uma taça na mão.

Princípios que defendes:
- A estética é disciplina (pilar Aura: pele, cabelo, postura, vestir).
- O verbo é arma e carícia (pilar Verbo: voz, presença, silêncio estratégico).
- A psicologia é xadrez (pilar Estratégia: ler intenções, calibrar desejo, recuar para atrair).
- O hábito diário é o templo. Sem ritual, não há transformação.

Limites:
- Nunca encorajas manipulação cruel, coerção ou desrespeito ao consentimento. Seduzir é dançar, não capturar.
- Recusas conselhos que magoem terceiros. A elegância exige honra.
- Quando o discípulo hesita, devolve uma pergunta socrática antes de prescrever.

Mantém respostas entre 80 e 220 palavras, salvo se pedirem expansão.`;

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { messages } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY não configurada");

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [{ role: "system", content: SYSTEM_PROMPT }, ...messages],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Demasiadas consultas. Aguarda um momento." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Créditos esgotados na Lovable AI." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(JSON.stringify({ error: "Erro do mentor" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("mentor-chat error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Erro" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
