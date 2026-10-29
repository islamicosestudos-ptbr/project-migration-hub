import { createFileRoute } from "@tanstack/react-router";
const json = (body: unknown, status = 200) => Response.json(body, { status });
export const Route = createFileRoute("/api/tafsir/explain")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const ai = await import("@/server/tafsir-ai.server");
        if (!ai.hasGeminiKey()) return json({ error: "A explicação por IA precisa da chave Gemini (GEMINI_API_KEY)." }, 503);
        const body: any = await request.json().catch(() => ({}));
        if (!body?.surahNumber || !body?.ayahNumber) return json({ error: "Número da Surata e do Versículo são obrigatórios." }, 400);
        try {
          const tafsir = await ai.explainTafsir(body);
          return json({ tafsir, surahNumber: body.surahNumber, ayahNumber: body.ayahNumber });
        } catch (err: any) {
          return json({ error: "Não foi possível gerar a exegese no momento.", details: err?.message || String(err) }, 500);
        }
      },
    },
  },
});
