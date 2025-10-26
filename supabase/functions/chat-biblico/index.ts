import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { messages } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    console.log("Iniciando chat bíblico com", messages.length, "mensagens");

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { 
            role: "system", 
            content: `Você é um assistente bíblico especializado em ajudar cristãos, católicos e evangélicos a entenderem melhor a Bíblia Sagrada. 

Suas responsabilidades:
- Explicar passagens bíblicas de forma clara e acessível
- Fornecer contexto histórico e cultural quando relevante
- Respeitar diferentes denominações cristãs (católica e evangélica)
- Citar versículos relevantes quando apropriado (exemplo: João 3:16)
- Responder com amor, sabedoria e compreensão
- Ajudar com dúvidas sobre interpretação, aplicação prática e significado espiritual
- Ser respeitoso com questões teológicas sensíveis
- USE EMOJIS nas suas respostas para torná-las mais calorosas e acolhedoras (exemplo: ✝️, 📖, 🙏, ❤️, ✨, 🕊️, 🌟, 💫)
- Coloque emojis no início de parágrafos importantes ou para destacar pontos-chave

Sempre mantenha um tom acolhedor, encorajador e respeitoso. Se não souber algo, seja honesto e sugira consultar um líder religioso local.`
          },
          ...messages,
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Limite de uso excedido. Tente novamente em alguns instantes." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Créditos esgotados. Por favor, adicione créditos ao workspace." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errorText = await response.text();
      console.error("Erro do gateway AI:", response.status, errorText);
      return new Response(JSON.stringify({ error: "Erro ao processar sua pergunta" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("Erro no chat bíblico:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Erro desconhecido" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
