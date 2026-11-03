import { createFileRoute } from "@tanstack/react-router";
import { Target, Users, Waves } from "lucide-react";
import { PageHeader } from "@/components/site-layout";

export const Route = createFileRoute("/tentang")({
  head: () => ({
    meta: [
      { title: "Tentang Kami — SORTARA AI" },
      { name: "description", content: "Misi SORTARA AI membantu mengurangi masalah sampah di Bali." },
      { property: "og:title", content: "Tentang Kami — SORTARA AI" },
      { property: "og:description", content: "Teknologi untuk Bali yang lebih bersih." },
    ],
  }),
  component: Tentang,
});

const items = [
  { icon: Target, title: "Tujuan Kami", desc: "Membantu masyarakat Bali memilah sampah dari rumah agar lebih sedikit sampah berakhir di TPA dan lautan." },
  { icon: Users, title: "Untuk Semua", desc: "Dirancang sederhana untuk keluarga, pelajar, pelaku usaha, dan wisatawan." },
  { icon: Waves, title: "Jaga Alam Bali", desc: "Pantai, sungai, dan sawah yang bersih adalah warisan yang harus kita lindungi bersama." },
];

function Tentang() {
  return (
    <>
      <PageHeader eyebrow="Tentang Kami" title="Teknologi untuk Bali yang lebih bersih" desc="SORTARA AI lahir dari kepedulian terhadap masalah sampah di Bali. Kami percaya perubahan besar dimulai dari kebiasaan kecil: memilah sampah dengan benar." />
      <section className="mx-auto grid max-w-6xl gap-6 px-4 py-12 md:grid-cols-3">
        {items.map((i) => (
          <div key={i.title} className="rounded-3xl border border-border bg-card p-6">
            <span className="grid h-12 w-12 place-items-center rounded-xl bg-secondary text-primary"><i.icon /></span>
            <h2 className="mt-4 text-xl font-semibold">{i.title}</h2>
            <p className="mt-2 text-muted-foreground">{i.desc}</p>
          </div>
        ))}
      </section>
      <section className="mx-auto max-w-6xl px-4 pb-16">
        <div className="rounded-3xl bg-brand p-8 text-primary-foreground md:p-12">
          <h2 className="text-2xl font-bold md:text-3xl">Scan Smart, Sort Right, Save Bali.</h2>
          <p className="mt-3 max-w-2xl opacity-90">Setiap sampah yang terpilah dengan benar adalah satu langkah menuju Pulau Dewata yang lestari.</p>
        </div>
      </section>
    </>
  );
}
