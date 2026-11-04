import { createFileRoute } from "@tanstack/react-router";
import { CheckCircle2 } from "lucide-react";
import { PageHeader } from "@/components/site-layout";
import { categories } from "@/lib/waste-guide";

export const Route = createFileRoute("/panduan")({
  head: () => ({
    meta: [
      { title: "Panduan Sampah — SORTARA AI" },
      { name: "description", content: "Panduan memilah sampah organik, plastik, kertas, kaca, dan logam." },
      { property: "og:title", content: "Panduan Sampah — SORTARA AI" },
      { property: "og:description", content: "Cara memilah 5 jenis sampah dengan benar." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Panduan,
});

function Panduan() {
  return (
    <>
      <PageHeader eyebrow="Panduan" title="Panduan memilah sampah" desc="Kenali lima kategori utama sampah dan cara menanganinya sebelum dibuang atau didaur ulang." />
      <section className="mx-auto grid max-w-6xl gap-6 px-4 py-12 md:grid-cols-2 lg:grid-cols-3">
        {categories.map((c) => (
          <article key={c.key} className="rounded-3xl border border-border bg-card p-6 transition hover:shadow-elegant">
            <div className={`grid h-14 w-14 place-items-center rounded-2xl text-3xl ${c.color}`}>{c.emoji}</div>
            <h2 className="mt-4 text-2xl font-bold">{c.name}</h2>
            <p className="mt-1 text-sm text-muted-foreground">Contoh: {c.examples}</p>
            <ul className="mt-4 space-y-2">
              {c.tips.map((t) => (
                <li key={t} className="flex gap-2 text-sm"><CheckCircle2 className="h-4 w-4 shrink-0 text-primary" /> {t}</li>
              ))}
            </ul>
          </article>
        ))}
      </section>
    </>
  );
}
