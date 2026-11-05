import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, BookOpen, Camera, Recycle, Sparkles } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "PilahBali — Kenali Sampahmu, Jaga Bali." },
      { name: "description", content: "Platform edukasi pemilahan sampah berbasis AI untuk masyarakat Bali." },
      { property: "og:title", content: "PilahBali — Kenali Sampahmu, Jaga Bali." },
      { property: "og:description", content: "Pindai sampah, pahami kategorinya, dan pilah dengan benar." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

const benefits = [
  { icon: Camera, title: "Pindai dengan Foto", desc: "Unggah foto sampah dari laptop atau HP untuk dikenali." },
  { icon: Recycle, title: "Pilah dengan Tepat", desc: "Ketahui kategori sampah dan cara memilahnya dengan benar." },
  { icon: BookOpen, title: "Belajar Setiap Hari", desc: "Panduan lengkap organik, plastik, kertas, kaca, dan logam." },
];

function Index() {
  return (
    <>
      <section className="bg-hero">
        <div className="mx-auto grid max-w-6xl items-center gap-12 px-4 py-16 md:grid-cols-2 md:py-24">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-xs font-semibold text-primary">
              <Sparkles className="h-3.5 w-3.5 text-sun-foreground" /> Edukasi sampah berbasis AI untuk Bali
            </span>
            <h1 className="mt-5 text-4xl font-bold leading-tight md:text-6xl">
              Kenali Sampahmu, <span className="text-primary">Jaga Bali</span>.
            </h1>
            <p className="mt-5 max-w-lg text-lg text-muted-foreground">
              PilahBali membantu masyarakat Bali mengenali jenis sampah dan memilahnya dengan benar — cukup dari satu foto.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/scanner" className="inline-flex items-center gap-2 rounded-full bg-brand px-6 py-3 font-semibold text-primary-foreground shadow-elegant transition hover:opacity-90">
                Mulai Scan Sampah <ArrowRight className="h-4 w-4" />
              </Link>
              <Link to="/panduan" className="inline-flex items-center rounded-full border border-border bg-card px-6 py-3 font-semibold transition hover:bg-secondary">
                Lihat Panduan
              </Link>
            </div>
          </div>
          <div className="relative">
            <div className="rounded-3xl border border-border bg-card p-6 shadow-elegant">
              <div className="grid aspect-[4/3] place-items-center rounded-2xl border-2 border-dashed border-primary/30 bg-secondary">
                <div className="text-center">
                  <Camera className="mx-auto h-12 w-12 text-primary" />
                  <p className="mt-3 font-display font-semibold">Arahkan. Foto. Pilah.</p>
                </div>
              </div>
              <div className="mt-4 grid grid-cols-5 gap-2 text-center text-xs">
                {["🍃", "🧴", "📦", "🍾", "🥫"].map((e) => (
                  <div key={e} className="rounded-xl bg-muted py-2 text-xl">{e}</div>
                ))}
              </div>
            </div>
            <div className="absolute -bottom-4 -left-4 rounded-2xl bg-sun px-4 py-2 text-sm font-semibold text-sun-foreground shadow-elegant">5 kategori sampah</div>
          </div>
        </div>
      </section>
      <section className="mx-auto max-w-6xl px-4 py-16 md:py-20">
        <h2 className="text-3xl font-bold md:text-4xl">Kenapa PilahBali?</h2>
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {benefits.map((b) => (
            <div key={b.title} className="rounded-2xl border border-border bg-card p-6 transition hover:shadow-elegant">
              <span className="grid h-12 w-12 place-items-center rounded-xl bg-secondary text-primary"><b.icon /></span>
              <h3 className="mt-4 text-xl font-semibold">{b.title}</h3>
              <p className="mt-2 text-muted-foreground">{b.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
