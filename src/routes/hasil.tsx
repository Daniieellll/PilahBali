import { createFileRoute, Link } from "@tanstack/react-router";
import { Info, Package, Tag, ListChecks } from "lucide-react";
import { useEffect, useState } from "react";
import { PageHeader } from "@/components/site-layout";

export const Route = createFileRoute("/hasil")({
  head: () => ({
    meta: [
      { title: "Hasil Analisis — SORTARA AI" },
      { name: "description", content: "Lihat nama benda, kategori sampah, dan petunjuk pemilahan." },
      { property: "og:title", content: "Hasil Analisis — SORTARA AI" },
      { property: "og:description", content: "Nama benda, kategori, dan petunjuk pemilahan sampah." },
    ],
  }),
  component: Hasil,
});

function Field({ icon: Icon, label, children }: { icon: typeof Tag; label: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <p className="flex items-center gap-2 text-sm font-medium text-muted-foreground"><Icon className="h-4 w-4 text-primary" /> {label}</p>
      <div className="mt-2">{children}</div>
    </div>
  );
}

function Hasil() {
  const [img, setImg] = useState<string | null>(null);
  useEffect(() => { setImg(sessionStorage.getItem("sortara-image")); }, []);
  const pending = <p className="font-display text-lg font-semibold text-muted-foreground">Menunggu analisis AI</p>;

  return (
    <>
      <PageHeader eyebrow="Hasil" title="Hasil analisis sampah" desc="Di sini akan tampil nama benda, kategori sampah, dan petunjuk pemilahannya." />
      <section className="mx-auto max-w-6xl px-4 py-12">
        <div className="mb-8 flex gap-3 rounded-2xl border border-sun bg-sun/20 p-4 text-sm text-sun-foreground">
          <Info className="h-5 w-5 shrink-0" />
          <p>Fitur analisis AI belum aktif pada tahap ini. Tampilan di bawah adalah kerangka hasil — belum ada analisis sungguhan yang dilakukan.</p>
        </div>
        <div className="grid gap-6 md:grid-cols-[1fr_1.2fr]">
          <div className="grid min-h-72 place-items-center overflow-hidden rounded-3xl border border-border bg-muted">
            {img ? <img src={img} alt="Foto yang diunggah" className="max-h-96 w-full object-contain" /> : (
              <div className="p-6 text-center text-sm text-muted-foreground">
                Belum ada foto. <Link to="/scanner" className="font-semibold text-primary underline">Unggah di Scanner</Link>
              </div>
            )}
          </div>
          <div className="grid gap-4">
            <Field icon={Package} label="Nama Benda">{pending}</Field>
            <Field icon={Tag} label="Kategori Sampah">{pending}</Field>
            <Field icon={ListChecks} label="Petunjuk Pemilahan">
              <p className="text-muted-foreground">Petunjuk akan muncul setelah AI terhubung. Sementara itu, lihat <Link to="/panduan" className="font-semibold text-primary underline">Panduan Sampah</Link>.</p>
            </Field>
            <Link to="/scanner" className="inline-flex justify-center rounded-full bg-brand px-6 py-3 font-semibold text-primary-foreground shadow-elegant">Scan Sampah Lain</Link>
          </div>
        </div>
      </section>
    </>
  );
}
