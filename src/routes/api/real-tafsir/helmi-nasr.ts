import { createFileRoute } from "@tanstack/react-router";
const json = (body: unknown, status = 200) => Response.json(body, { status });
export const Route = createFileRoute("/api/real-tafsir/helmi-nasr")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const q = new URL(request.url).searchParams;
        const surah = Number(q.get("surah"));
        const ayah = Number(q.get("ayah"));
        if (!surah || !ayah) return json({ error: "Surah e Ayah são obrigatórios." }, 400);
        const { getHelmiNasr } = await import("@/server/sources.server");
        try {
          return json(await getHelmiNasr(surah, ayah));
        } catch (error: any) {
          return json({ error: "Falha ao buscar notas oficiais do Dr. Helmi Nasr no QuranEnc.", details: error?.message }, 500);
        }
      },
    },
  },
});
