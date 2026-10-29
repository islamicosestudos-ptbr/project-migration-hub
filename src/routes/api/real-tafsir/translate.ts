import { createFileRoute } from "@tanstack/react-router";
const json = (body: unknown, status = 200) => Response.json(body, { status });
export const Route = createFileRoute("/api/real-tafsir/translate")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const ai = await import("@/server/tafsir-ai.server");
        if (!ai.hasGeminiKey()) return json({ error: "A tradução automática do tafsir precisa da chave Gemini (GEMINI_API_KEY)." }, 503);
        const body: any = await request.json().catch(() => ({}));
        if (!body?.text || typeof body.text !== "string") return json({ error: "Texto para tradução é obrigatório." }, 400);
        try {
          return json({ translatedText: await ai.translateTafsir(body.text, body.title) });
        } catch (error: any) {
          console.error("Erro ao traduzir Tafsir:", error?.message || error);
          return json({ error: "Não foi possível traduzir o texto completo agora. O original em inglês foi mantido — tente novamente em instantes.", details: error?.message }, 502);
        }
      },
    },
  },
});
