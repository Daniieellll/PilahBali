import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { ImageUp, ScanLine, Trash2 } from "lucide-react";
import { useRef, useState } from "react";
import { PageHeader } from "@/components/site-layout";

export const Route = createFileRoute("/scanner")({
  head: () => ({
    meta: [
      { title: "Scanner Sampah — SORTARA AI" },
      { name: "description", content: "Unggah foto sampah untuk dianalisis oleh SORTARA AI." },
      { property: "og:title", content: "Scanner Sampah — SORTARA AI" },
      { property: "og:description", content: "Unggah foto sampah dan mulai analisis." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Scanner,
});

function Scanner() {
  const [preview, setPreview] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [drag, setDrag] = useState(false);
  const input = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  const load = (file?: File) => {
    if (!file || !file.type.startsWith("image/")) return;
    const r = new FileReader();
    r.onload = () => {
      const im = new Image();
      im.onload = () => {
        const s = Math.min(1, 1280 / Math.max(im.width, im.height));
        const c = document.createElement("canvas");
        c.width = im.width * s; c.height = im.height * s;
        c.getContext("2d")?.drawImage(im, 0, 0, c.width, c.height);
        setPreview(c.toDataURL("image/jpeg", 0.85)); setName(file.name);
      };
      im.src = r.result as string;
    };
    r.readAsDataURL(file);
  };

  const analyze = () => {
    if (!preview) return;
    try { sessionStorage.setItem("sortara-image", preview); } catch { /* gambar terlalu besar */ }
    navigate({ to: "/hasil" });
  };

  return (
    <>
      <PageHeader eyebrow="Scanner" title="Unggah foto sampahmu" desc="Pilih foto dari laptop atau HP. Pastikan benda terlihat jelas dengan pencahayaan cukup." />
      <section className="mx-auto grid max-w-6xl gap-8 px-4 py-12 md:grid-cols-2">
        <div
          onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
          onDragLeave={() => setDrag(false)}
          onDrop={(e) => { e.preventDefault(); setDrag(false); load(e.dataTransfer.files[0]); }}
          onClick={() => input.current?.click()}
          className={`grid min-h-80 cursor-pointer place-items-center rounded-3xl border-2 border-dashed p-8 text-center transition ${drag ? "border-primary bg-secondary" : "border-border bg-card hover:border-primary/50"}`}
        >
          <input ref={input} type="file" accept="image/*" hidden onChange={(e) => load(e.target.files?.[0])} />
          <div>
            <span className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-secondary text-primary"><ImageUp className="h-8 w-8" /></span>
            <p className="mt-4 font-display text-lg font-semibold">Klik atau seret foto ke sini</p>
            <p className="mt-1 text-sm text-muted-foreground">Format JPG, PNG, atau WEBP</p>
          </div>
        </div>
        <div className="flex flex-col rounded-3xl border border-border bg-card p-6">
          <h2 className="text-xl font-semibold">Pratinjau Gambar</h2>
          <div className="mt-4 grid flex-1 min-h-64 place-items-center overflow-hidden rounded-2xl bg-muted">
            {preview ? <img src={preview} alt="Pratinjau sampah" className="max-h-80 w-full object-contain" /> : <p className="text-sm text-muted-foreground">Belum ada gambar dipilih</p>}
          </div>
          {preview && (
            <div className="mt-3 flex items-center justify-between text-sm text-muted-foreground">
              <span className="truncate">{name}</span>
              <button onClick={() => { setPreview(null); setName(""); }} className="inline-flex items-center gap-1 hover:text-destructive"><Trash2 className="h-4 w-4" /> Hapus</button>
            </div>
          )}
          <button disabled={!preview} onClick={analyze} className="mt-5 inline-flex items-center justify-center gap-2 rounded-full bg-brand px-6 py-3 font-semibold text-primary-foreground shadow-elegant transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40">
            <ScanLine className="h-5 w-5" /> Analisis Sampah
          </button>
        </div>
      </section>
    </>
  );
}
