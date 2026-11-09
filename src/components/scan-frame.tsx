import { BrainCircuit } from "lucide-react";
import { useApp } from "@/components/app-context";

export function ScanFrame({ image, loading = false }: { image: string; loading?: boolean }) {
  const { t } = useApp();
  return (
    <figure className="m-0 min-w-0" aria-busy={loading}>
      <div className="scan-frame relative grid aspect-[4/3] place-items-center overflow-hidden rounded-xl border border-border bg-muted">
        <img src={image} alt={t("Foto yang diunggah untuk dianalisis", "Uploaded photo for analysis")} className="h-full min-h-0 w-full object-contain" />
        <div aria-hidden="true" className="pointer-events-none absolute inset-4">
          <span className="scan-corner scan-corner-tl" />
          <span className="scan-corner scan-corner-tr" />
          <span className="scan-corner scan-corner-bl" />
          <span className="scan-corner scan-corner-br" />
          {loading && <span className="scan-beam" />}
        </div>
      </div>
      <figcaption role="status" aria-live="polite" aria-atomic="true" className="flex min-h-16 items-center gap-3 px-1 py-3 text-sm">
        {loading ? <><span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-secondary text-primary"><BrainCircuit aria-hidden="true" className="scan-ai-icon h-5 w-5" /></span><span className="font-medium">{t("AI sedang mengenali jenis sampah", "AI is identifying your waste")}<span aria-hidden="true" className="scan-dots">…</span></span></> : <span className="text-muted-foreground">{t("Foto yang diunggah", "Uploaded photo")}</span>}
      </figcaption>
    </figure>
  );
}