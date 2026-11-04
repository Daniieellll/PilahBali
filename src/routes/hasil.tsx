import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { AlertTriangle, HelpCircle, ListChecks, Loader2, MessageSquareText, Package, Tag } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { PageHeader } from "@/components/site-layout";
import { Button } from "@/components/ui/button";
import { analyzeWaste, type AnalysisResult } from "@/lib/analyze.functions";
import { categories } from "@/lib/waste-guide";

export const Route = createFileRoute("/hasil")({
  head: () => ({
    meta: [
      { title: "Hasil Analisis — SORTARA AI" },
      { name: "description", content: "Lihat nama benda, kategori sampah, dan petunjuk pemilahan." },
      { property: "og:title", content: "Hasil Analisis — SORTARA AI" },
      { property: "og:description", content: "Nama benda, kategori, dan petunjuk pemilahan sampah." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
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
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const analyze = useServerFn(analyzeWaste);
  const started = useRef(false);

  const run = useCallback(async (image: string) => {
    setLoading(true);
    setResult(null);
    try {
      setResult(await analyze({ data: { image } }));
    } catch {
      setResult({ ok: false, error: "Gagal menganalisis gambar. Coba lagi." });
    } finally {
      setLoading(false);
    }
  }, [analyze]);

  useEffect(() => {
    const s = sessionStorage.getItem("sortara-image");
    setImg(s);
    if (s && !started.current) { started.current = true; run(s); }
  }, [run]);

  return (
    <>
      <PageHeader eyebrow="Hasil" title="Hasil analisis sampah" desc="Nama benda, kategori sampah, alasan, dan saran pemilahan dari AI." />
      <section className="mx-auto max-w-6xl px-4 py-12">
        <div className="grid gap-6 md:grid-cols-[1fr_1.2fr]">
          <div className="grid min-h-72 place-items-center overflow-hidden rounded-3xl border border-border bg-muted">
            {img ? <img src={img} alt="Foto yang diunggah" className="max-h-96 w-full object-contain" /> : (
              <div className="p-6 text-center text-sm text-muted-foreground">
                Belum ada foto. <Link to="/scanner" className="font-semibold text-primary underline">Unggah di Scanner</Link>
              </div>
            )}
          </div>
          <div className="grid content-start gap-4">
            {loading && (
              <div className="flex items-center gap-3 rounded-2xl border border-border bg-card p-6">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
                <div><p className="font-display font-semibold">AI sedang menganalisis foto…</p><p className="text-sm text-muted-foreground">Biasanya beberapa detik.</p></div>
              </div>
            )}
            {result && !result.ok && (
              <div className="flex gap-3 rounded-2xl border border-destructive/40 bg-destructive/10 p-5 text-sm">
                <AlertTriangle className="h-5 w-5 shrink-0 text-destructive" />
                <div className="flex-1"><p className="font-semibold">Analisis gagal</p><p className="text-muted-foreground">{result.error}</p></div>
                {img && <Button variant="link" onClick={() => run(img)}>Coba lagi</Button>}
              </div>
            )}
            {result?.ok && !result.recognized && (
              <div role="status" className="flex gap-3 rounded-2xl border border-sun bg-sun/20 p-5 text-sm text-sun-foreground">
                <HelpCircle className="h-5 w-5 shrink-0" /><p>{result.message}</p>
              </div>
            )}
            {result?.ok && result.recognized && (
              <>
                {result.mixed && <h2 className="text-xl font-semibold">Beberapa objek sampah teridentifikasi</h2>}
                {result.objects.map((object, index) => {
                  const cat = categories.find((c) => c.key === object.category);
                  return <div key={`${object.name}-${index}`} className="grid gap-4">
                    <Field icon={Package} label="Nama Benda"><p className="font-display text-2xl font-bold break-words">{object.name}</p></Field>
                    <Field icon={Tag} label="Kategori Sampah">
                      <span className={`inline-flex items-center gap-2 rounded-full px-4 py-1.5 font-semibold ${cat?.color ?? "bg-secondary"}`}>{cat?.emoji} {cat?.name ?? object.category}</span>
                    </Field>
                    <Field icon={MessageSquareText} label="Alasan Klasifikasi"><p>{object.reason}</p></Field>
                    <Field icon={ListChecks} label="Saran Pemilahan">
                      <ul className="list-disc space-y-1 pl-5">{object.tips.map((t) => <li key={t}>{t}</li>)}</ul>
                    </Field>
                  </div>;
                })}
                {(result.limitations || result.unclassified.length > 0) && <div role="status" className="rounded-2xl border border-sun bg-sun/20 p-5 text-sm text-sun-foreground">
                  <p className="font-semibold">Keterbatasan analisis</p>
                  {result.limitations && <p className="mt-1">{result.limitations}</p>}
                  {result.unclassified.length > 0 && <p className="mt-2">Belum dapat dikategorikan dengan yakin: {result.unclassified.join(", ")}.</p>}
                </div>}
                <p className="text-xs text-muted-foreground">Hasil dari AI bisa keliru. Cek kembali dengan <Link to="/panduan" className="underline">Panduan Sampah</Link>.</p>
              </>
            )}
            {!img && <Field icon={ListChecks} label="Belum ada analisis"><p className="text-muted-foreground">Unggah foto di Scanner untuk memulai.</p></Field>}
            <Button asChild className="h-auto whitespace-normal rounded-full bg-brand px-6 py-3 font-semibold shadow-elegant"><Link to="/scanner">{result?.ok && !result.recognized ? "Unggah Foto Lain" : "Scan Sampah Lain"}</Link></Button>
          </div>
        </div>
      </section>
    </>
  );
}
