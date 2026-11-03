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
    try {
      const res = await fetch(
        "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent",
        {
          method: "POST",
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
                  category: { type: "STRING", enum: ["organik", "plastik", "kertas", "kaca", "logam", ""] },
                  reason: { type: "STRING" },
                  tips: { type: "ARRAY", items: { type: "STRING" } },
                },
                required: ["recognized"],
              },
            },
          }),
        },
      );
      if (!res.ok) {
        console.error("Gemini error", res.status, await res.text());
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
