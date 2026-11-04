import { z } from "zod";

export const NON_WASTE_MESSAGE = "Gambar ini bukan sampah yang dapat kami identifikasi. Silakan unggah foto sampah seperti plastik, kertas, logam, kaca, atau organik.";
export const RETAKE_MESSAGE = "Foto buram, terlalu gelap, atau objek tidak terlihat jelas. Silakan ambil foto ulang dengan pencahayaan cukup dan fokus pada sampah.";
export const UNCERTAIN_MESSAGE = "AI belum yakin bahwa objek ini adalah sampah yang dapat diidentifikasi. Silakan ambil foto ulang lebih dekat dan lebih jelas; kategori tidak ditentukan.";

const categorySchema = z.enum(["organik", "plastik", "kertas", "kaca", "logam"]);
const objectSchema = z.object({
  name: z.string().trim().min(1),
  isWaste: z.boolean(),
  confidence: z.enum(["high", "medium", "low"]),
  category: z.union([categorySchema, z.literal("tidak_dikenali")]),
  reason: z.string().trim().min(1),
  tips: z.array(z.string().trim().min(1)).max(4),
});
export const providerResultSchema = z.object({
  status: z.enum(["waste", "non_waste", "unclear", "uncertain"]),
  imageQuality: z.enum(["clear", "blurred", "dark", "obscured"]),
  containsWaste: z.boolean(),
  multipleObjects: z.boolean(),
  objects: z.array(objectSchema).max(12),
  limitations: z.string().trim(),
});

export type WasteObject = { name: string; category: z.infer<typeof categorySchema>; reason: string; tips: string[] };
export type AnalysisResult =
  | { ok: true; recognized: true; name: string; category: WasteObject["category"]; reason: string; tips: string[]; objects: WasteObject[]; mixed: boolean; limitations: string; unclassified: string[] }
  | { ok: true; recognized: false; status: "non_waste" | "unclear" | "uncertain"; message: string }
  | { ok: false; error: string };

export function normalizeAnalysis(input: unknown): AnalysisResult {
  const parsed = providerResultSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "Respons AI tidak lengkap atau tidak valid. Silakan coba lagi." };
  const r = parsed.data;
  if (r.imageQuality !== "clear" || r.status === "unclear")
    return { ok: true, recognized: false, status: "unclear", message: RETAKE_MESSAGE };
  if (r.status === "non_waste")
    return { ok: true, recognized: false, status: "non_waste", message: NON_WASTE_MESSAGE };
  if (r.status !== "waste" || !r.containsWaste)
    return { ok: true, recognized: false, status: "uncertain", message: UNCERTAIN_MESSAGE };
  const objects: WasteObject[] = [];
  const unclassified: string[] = [];
  for (const item of r.objects) {
    if (!item.isWaste) continue;
    const category = categorySchema.safeParse(item.category);
    if (item.confidence !== "high" || !category.success || item.tips.length === 0) {
      unclassified.push(item.name);
      continue;
    }
    objects.push({ name: item.name, category: category.data, reason: item.reason, tips: item.tips });
  }
  const first = objects[0];
  if (!first) return { ok: true, recognized: false, status: "uncertain", message: UNCERTAIN_MESSAGE };
  const mixed = r.multipleObjects || objects.length > 1 || unclassified.length > 0;
  return {
    ok: true, recognized: true, ...first, objects, mixed, unclassified,
    limitations: mixed
      ? [r.limitations, "Hanya objek sampah yang terlihat jelas dan dikenali dengan yakin yang dikategorikan. Bahan yang tertutup atau tidak pasti tidak dikategorikan; foto tiap benda secara terpisah untuk hasil lebih rinci."].filter(Boolean).join(" ")
      : r.limitations,
  };
}