// @ts-nocheck
import { GoogleGenerativeAI } from "npm:@google/generative-ai";

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
    const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");
    
    if (!GEMINI_API_KEY) throw new Error("GEMINI_API_KEY não configurada");

    const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
      systemInstruction: SYSTEM_PROMPT,
    });

    const history = messages.slice(0, -1).map((msg: any) => ({
      role: msg.role === "assistant" ? "model" : "user",
      parts: [{ text: msg.content }],
    }));
    
    const latestMessage = messages[messages.length - 1].content;
    const chat = model.startChat({ history });
    const result = await chat.sendMessageStream(latestMessage);

    const encoder = new TextEncoder();
    const readableStream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of result.stream) {
            const text = chunk.text();
            // Formato compatível com OpenAI SSE (Server-Sent Events) esperado pelo frontend
            const payload = `data: ${JSON.stringify({ choices: [{ delta: { content: text } }] })}\n\n`;
            controller.enqueue(encoder.encode(payload));
          }
          controller.enqueue(encoder.encode("data: [DONE]\n\n"));
          controller.close();
        } catch (e) {
          controller.error(e);
        }
      }
    });

    return new Response(readableStream, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e: any) {
    console.error("mentor-chat error:", e);
    if (e.message?.includes("quota") || e.status === 429) {
      return new Response(JSON.stringify({ error: "Cota excedida. Aguarda um momento." }), {
        status: 429,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    return new Response(JSON.stringify({ error: e.message || "Erro interno" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
