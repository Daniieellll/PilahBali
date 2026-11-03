import { createServerFn } from "@tanstack/react-start";

export type AnalysisResult =
  | { ok: true; recognized: true; name: string; category: string; reason: string; tips: string[] }
  | { ok: true; recognized: false; message: string }
  | { ok: false; error: string };

const PROMPT = `Kamu adalah asisten pemilahan sampah untuk masyarakat Bali. Lihat foto ini.
Jika benda utama adalah sampah/barang buangan yang jelas terlihat, isi recognized=true, name (nama benda dalam Bahasa Indonesia), category (salah satu: organik, plastik, kertas, kaca, logam), reason (alasan singkat klasifikasi), tips (2-4 saran pemilahan praktis).
Jika gambar buram, tidak jelas, bukan sampah, atau tidak cocok dengan kelima kategori, isi recognized=false dan kosongkan field lain. Jangan menebak.`;

export const analyzeWaste = createServerFn({ method: "POST" })
  .inputValidator((d: { image: string }) => {
    if (typeof d?.image !== "string" || !d.image.startsWith("data:image/")) throw new Error("Gambar tidak valid");
    if (d.image.length > 8_000_000) throw new Error("Ukuran gambar terlalu besar");
    return d;
  })
  .handler(async ({ data }): Promise<AnalysisResult> => {
    const key = process.env["GEMINI_API_KEY"];
    if (!key) return { ok: false, error: "Kunci AI belum dikonfigurasi." };
    const [meta, b64] = data.image.split(",");
    const mime = meta.slice(5, meta.indexOf(";"));
    if (!b64 || !mime) return { ok: false, error: "Data gambar tidak terbaca." };
    console.log("[analyze] key set:", true, "mime:", mime, "base64 KB:", Math.round(b64.length / 1024));
    const models = ["gemini-3.5-flash-lite", "gemini-3.1-flash-lite", "gemini-2.5-flash-lite"];
    let res: Response | null = null;
    try {
      for (const model of models) {
      try {
      res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,
        {
          method: "POST",
          signal: AbortSignal.timeout(25000),
          headers: { "Content-Type": "application/json", "x-goog-api-key": key },
          body: JSON.stringify({
            contents: [{ parts: [{ text: PROMPT }, { inline_data: { mime_type: mime, data: b64 } }] }],
            generationConfig: {
              responseMimeType: "application/json",
              responseSchema: {
                type: "OBJECT",
                properties: {
                  recognized: { type: "BOOLEAN" },
                  name: { type: "STRING" },
                  category: { type: "STRING", enum: ["organik", "plastik", "kertas", "kaca", "logam", "tidak_dikenali"] },
                  reason: { type: "STRING" },
                  tips: { type: "ARRAY", items: { type: "STRING" } },
                },
                required: ["recognized"],
              },
            },
          }),
        },
      );
      } catch (e) {
        console.error(`[analyze] ${model} request failed:`, (e as Error).name, (e as Error).message);
        res = null; continue;
      }
      if (res.ok) { console.log(`[analyze] ${model} OK`); break; }
      const body = await res.text();
      console.error(`[analyze] ${model} HTTP ${res.status}:`, body.slice(0, 500));
      if (![404, 500, 503].includes(res.status)) break;
      }
      if (!res) return { ok: false, error: "AI tidak merespons tepat waktu. Coba lagi." };
      if (!res.ok) {
        if (res.status === 503) return { ok: false, error: "Server AI sedang sibuk. Coba lagi beberapa saat." };
        if (res.status === 429) return { ok: false, error: "Kuota gratis AI sedang habis. Coba lagi nanti." };
        return { ok: false, error: "Layanan AI sedang bermasalah. Coba lagi." };
      }
      const json = await res.json();
      const text = json?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!text) return { ok: true, recognized: false, message: "AI belum dapat mengenali gambar ini." };
      const r = JSON.parse(text);
      const cats = ["organik", "plastik", "kertas", "kaca", "logam"];
      if (!r.recognized || !r.name || !cats.includes(r.category))
        return { ok: true, recognized: false, message: "AI belum dapat mengenali gambar ini. Pastikan foto jelas dan berisi sampah." };
      return { ok: true, recognized: true, name: r.name, category: r.category, reason: r.reason ?? "", tips: Array.isArray(r.tips) ? r.tips : [] };
    } catch (e) {
      console.error(e);
      return { ok: false, error: "Gagal menghubungi AI. Periksa koneksi lalu coba lagi." };
    }
  });
