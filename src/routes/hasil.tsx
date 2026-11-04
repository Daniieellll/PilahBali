import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { AlertTriangle, HelpCircle, ListChecks, Loader2, Tag } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { PageHeader } from "@/components/site-layout";
import { Button } from "@/components/ui/button";
import { analyzeWaste, type AnalysisResult } from "@/lib/analyze.functions";
import { categories } from "@/lib/waste-guide";

export const Route = createFileRoute("/hasil")({
  head: () => ({
    meta: [
      { title: "Hasil Analisis — SORTARA AI" },
      { name: "description", content: "Lihat benda yang dikenali, material, status penggunaan, dan rekomendasi pengelolaan SORTARA SMART ACTION." },
      { property: "og:title", content: "Hasil Analisis — SORTARA AI" },
      { property: "og:description", content: "Pengenalan benda, material, status sampah atau penggunaan, dan rekomendasi pengelolaan." },
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

function Section({ n, title, children }: { n: string; title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
      <p className="mb-3 flex items-center gap-2 font-display text-sm font-bold uppercase tracking-wide text-primary"><span className="grid h-6 w-6 place-items-center rounded-full bg-secondary text-xs">{n}</span>{title}</p>
      {children}
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
      <PageHeader eyebrow="Hasil" title="Hasil analisis sampah" desc="Nama benda, material, status, dan saran pengelolaan dari AI." />
      <section className="mx-auto max-w-6xl px-4 py-12">
        <div className="grid gap-6 md:grid-cols-[1fr_1.2fr]">
          <div className="grid min-h-72 self-start place-items-center overflow-hidden rounded-3xl border border-border bg-muted">
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
                <div><p className="font-display font-semibold">SORTARA Smart Action sedang menganalisis…</p><p className="text-sm text-muted-foreground">Mengenali objek, memeriksa kondisi, dan menyiapkan panduan.</p></div>
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
                {result.mixed && <h2 className="text-xl font-semibold">Beberapa objek teridentifikasi</h2>}
                {result.objects.map((object, index) => {
                  const cat = object.status === "WASTE" ? categories.find((c) => c.key === object.category?.toLowerCase()) : undefined;
                  const statusLabel = { WASTE: "WASTE · Sampah", NON_WASTE: "NON_WASTE · Bukan sampah", UNKNOWN: "UNKNOWN · Status belum pasti" } as const;
                  const residueLabel = { sisa_makanan: "Sisa makanan", cairan: "Cairan", kotoran: "Kotoran" } as const;
                  return <div key={`${object.name}-${index}`} className="grid gap-4">
                    <Section n="1" title="AI Waste Recognition">
                      <p className="text-sm text-muted-foreground">Nama objek</p>
                      <p className="font-display text-2xl font-bold break-words">{object.name}</p>
                      <span className="mt-3 inline-flex rounded-full bg-secondary px-4 py-1.5 text-sm font-semibold">{statusLabel[object.status]}</span>
                      <dl className="mt-3 grid gap-2 text-sm">
                        <div><dt className="font-medium">Material utama</dt><dd>{object.materials.primary ?? "Belum dapat dipastikan dari foto"}</dd></div>
                        <div><dt className="font-medium">Material tambahan</dt><dd>{object.materials.additional.length > 0 ? object.materials.additional.join(", ") : "Tidak teridentifikasi dengan yakin"}</dd></div>
                      </dl>
                      {object.status === "WASTE" && <div className="mt-3"><p className="text-sm text-muted-foreground">Kategori sampah</p><span className={`mt-1 inline-flex items-center gap-2 rounded-full px-4 py-1.5 font-semibold ${cat?.color ?? "bg-secondary"}`}>{cat?.emoji} {cat?.name ?? object.category ?? "Belum dapat dipastikan"}</span></div>}
                      {object.status === "NON_WASTE" && <p className="mt-3 text-sm text-muted-foreground">Benda belum tentu sampah dan dapat digunakan kembali jika kondisinya layak. Fungsi sebenarnya perlu diperiksa langsung.</p>}
                      {object.status === "UNKNOWN" && <p className="mt-3 text-sm text-muted-foreground">Benda dikenali, tetapi belum dapat dipastikan apakah merupakan sampah. Periksa fungsi dan kondisinya langsung; kategori tidak ditentukan.</p>}
                      <p className="mt-3"><span className="font-medium">Alasan: </span>{object.reason}</p>
                    </Section>
                    <Section n="2" title="Smart Waste Check">
                      <p>{object.condition.summary}</p>
                      {object.condition.residues.length > 0 && <div className="mt-3 flex flex-wrap gap-2">{object.condition.residues.map((r) => <span key={r} className="rounded-full bg-sun/30 px-3 py-1 text-xs font-semibold">Terlihat: {residueLabel[r]}</span>)}</div>}
                      {object.condition.actions.length > 0 && <ul className="mt-3 list-disc space-y-1 pl-5">{object.condition.actions.map((t) => <li key={t}>{t}</li>)}</ul>}
                      {!object.condition.certain && <p className="mt-3 rounded-xl bg-muted p-3 text-sm text-muted-foreground">Kondisi tidak dapat dipastikan sepenuhnya dari foto. Periksa langsung bagian dalam atau yang tidak terlihat.</p>}
                    </Section>
                    <Section n="3" title="Bali Waste Guide">
                      <p className="text-sm font-medium">{object.status === "WASTE" ? "Saran pengelolaan dari AI" : object.status === "NON_WASTE" ? "Saran penggunaan kembali dari AI" : "Pemeriksaan sebelum pengelolaan"}</p>
                      {object.tips.length > 0 ? <ul className="mt-1 list-disc space-y-1 pl-5">{object.tips.map((t) => <li key={t}>{t}</li>)}</ul> : <p className="mt-1 text-sm text-muted-foreground">Periksa kondisi dan fungsi benda secara langsung sebelum menentukan pengelolaannya.</p>}
                      {cat && <><p className="mt-3 text-sm font-medium">Panduan pemilahan {cat.name}</p><ul className="mt-1 list-disc space-y-1 pl-5">{cat.tips.map((t) => <li key={t}>{t}</li>)}</ul></>}
                      <p className="mt-3 text-xs text-muted-foreground">Lokasi bank sampah dan aturan daerah di Bali belum ditampilkan karena belum ada sumber terverifikasi. Tanyakan ke desa/banjar atau dinas lingkungan setempat.</p>
                    </Section>
                  </div>;
                })}
                {(result.limitations || result.unclassified.length > 0) && <div role="status" className="rounded-2xl border border-sun bg-sun/20 p-5 text-sm text-sun-foreground">
                  <p className="font-semibold">Keterbatasan analisis</p>
                  {result.limitations && <p className="mt-1">{result.limitations}</p>}
                   {result.unclassified.length > 0 && <p className="mt-2">Objek belum dapat dikenali dengan yakin: {result.unclassified.join(", ")}. Unggah foto lebih jelas.</p>}
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
