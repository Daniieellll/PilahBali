import { Link } from "@tanstack/react-router";
import { Leaf, Menu, X } from "lucide-react";
import { useState } from "react";

const nav = [
  { to: "/", label: "Beranda" },
  { to: "/scanner", label: "Scanner" },
  { to: "/hasil", label: "Hasil" },
  { to: "/panduan", label: "Panduan Sampah" },
  { to: "/tentang", label: "Tentang Kami" },
] as const;

export function Logo() {
  return (
    <Link to="/" className="flex items-center gap-2">
      <span className="grid h-9 w-9 place-items-center rounded-xl bg-brand text-primary-foreground shadow-elegant">
        <Leaf className="h-5 w-5" />
      </span>
      <span className="font-display text-lg font-bold tracking-tight">
        SORTARA <span className="text-primary">AI</span>
      </span>
    </Link>
  );
}

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/85 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <Logo />
        <nav className="hidden items-center gap-1 md:flex">
          {nav.map((n) => (
            <Link
              key={n.to}
              to={n.to}
              activeOptions={{ exact: true }}
              className="rounded-full px-4 py-2 text-sm font-medium text-muted-foreground transition hover:text-foreground"
              activeProps={{ className: "bg-secondary text-secondary-foreground" }}
            >
              {n.label}
            </Link>
          ))}
        </nav>
        <button className="md:hidden" aria-label="Menu" onClick={() => setOpen(!open)}>
          {open ? <X /> : <Menu />}
        </button>
      </div>
      {open && (
        <nav className="flex flex-col border-t border-border px-4 py-2 md:hidden">
          {nav.map((n) => (
            <Link
              key={n.to}
              to={n.to}
              onClick={() => setOpen(false)}
              activeOptions={{ exact: true }}
              className="rounded-lg px-3 py-3 text-sm font-medium text-muted-foreground"
              activeProps={{ className: "bg-secondary text-secondary-foreground" }}
            >
              {n.label}
            </Link>
          ))}
        </nav>
      )}
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-secondary/50">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-4 py-8 text-sm text-muted-foreground md:flex-row">
        <Logo />
        <p>Scan Smart, Sort Right, Save Bali · © 2026 SORTARA AI</p>
      </div>
    </footer>
  );
}

export function PageHeader({ eyebrow, title, desc }: { eyebrow: string; title: string; desc: string }) {
  return (
    <section className="bg-hero border-b border-border">
      <div className="mx-auto max-w-6xl px-4 py-14 md:py-20">
        <span className="inline-block rounded-full bg-sun px-3 py-1 text-xs font-semibold text-sun-foreground">{eyebrow}</span>
        <h1 className="mt-4 max-w-3xl text-3xl font-bold md:text-5xl">{title}</h1>
        <p className="mt-4 max-w-2xl text-muted-foreground md:text-lg">{desc}</p>
      </div>
    </section>
  );
}
