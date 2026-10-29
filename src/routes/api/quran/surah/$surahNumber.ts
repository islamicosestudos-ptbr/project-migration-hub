import { createFileRoute } from "@tanstack/react-router";
const json = (body: unknown, status = 200) => Response.json(body, { status });
export const Route = createFileRoute("/api/quran/surah/$surahNumber")({
  server: {
    handlers: {
      GET: async ({ params }) => {
        const n = Number(params.surahNumber);
        if (!Number.isInteger(n) || n < 1 || n > 114) return json({ error: "Número da surata inválido." }, 400);
        const { getSurah } = await import("@/server/sources.server");
        try {
          return json(await getSurah(n));
        } catch (error: any) {
          console.error(`Erro ao carregar traduções da surata ${n}:`, error?.message || error);
          return json({ error: "Não foi possível carregar todas as traduções desta surata. Verifique a conexão e tente novamente." }, 502);
        }
      },
    },
  },
});
