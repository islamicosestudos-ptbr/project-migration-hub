import { createFileRoute, ClientOnly } from "@tanstack/react-router";
import { lazy, Suspense } from "react";

// The reader relies on localStorage and browser audio, so it renders client-side only.
const App = lazy(() => import("@/legacy/App"));

const TITLE = "Alcorão Sagrado & Tafsir em Português";
const DESC =
  "Nobre Alcorão com caligrafia árabe Uthmani, traduções em português por Helmi Nasr e Samir El-Hayek, Tafsir exegético versículo a versículo, recitação em áudio e estudos temáticos.";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESC },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESC },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function Loading() {
  return <div className="min-h-screen bg-stone-50" />;
}

function Index() {
  return (
    <ClientOnly fallback={<Loading />}>
      <Suspense fallback={<Loading />}>
        <App />
      </Suspense>
    </ClientOnly>
  );
}
