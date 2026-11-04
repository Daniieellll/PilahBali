import { z } from "zod";

export const RETAKE_MESSAGE = "Foto buram, terlalu gelap, atau objek tidak terlihat jelas. Silakan ambil foto ulang dengan pencahayaan cukup dan fokus pada benda.";
export const UNCERTAIN_MESSAGE = "AI belum dapat mengenali objek dengan yakin. Silakan unggah foto yang lebih jelas dan lebih dekat.";
export const CONDITION_UNSURE = "Kondisi tidak dapat dipastikan dari foto. Periksa langsung bagian dalam, bagian yang tidak terlihat, dan fungsi benda.";

const confidenceSchema = z.enum(["high", "medium", "low"]);
const textSchema = z.string().trim().min(1).max(1500);
const conditionSchema = z.object({
  summary: z.string().trim().max(1500),
  residues: z.array(z.enum(["sisa_makanan", "cairan", "kotoran"])).max(3),
  certain: z.boolean(),
  actions: z.array(textSchema).max(4),
});
const objectSchema = z.object({
  name: textSchema,
  confidence: confidenceSchema,
  status: z.enum(["WASTE", "NON_WASTE", "UNKNOWN"]),
  statusConfidence: confidenceSchema,
  materials: z.object({
    primary: textSchema.nullable(),
    additional: z.array(textSchema).max(8),
    confidence: confidenceSchema,
  }),
  // Categories are extensible; recognition never depends on the guide's five categories.
  category: textSchema.nullable(),
  categoryConfidence: confidenceSchema,
  reason: textSchema,
  tips: z.array(textSchema).max(4),
  condition: conditionSchema.optional(),
});
export const providerResultSchema = z.object({
  imageQuality: z.enum(["clear", "blurred", "dark", "obscured"]),
  multipleObjects: z.boolean(),
  objects: z.array(objectSchema).max(12),
  limitations: z.string().trim().max(4000),
});

export type WasteCondition = z.infer<typeof conditionSchema>;
export type RecognizedObject = {
  name: string;
  status: "WASTE" | "NON_WASTE" | "UNKNOWN";
  materials: { primary: string | null; additional: string[]; confidence: z.infer<typeof confidenceSchema> };
  category: string | null;
  reason: string;
  tips: string[];
  condition: WasteCondition;
};
export type AnalysisResult =
  | { ok: true; recognized: true; objects: RecognizedObject[]; mixed: boolean; limitations: string; unclassified: string[] }
  | { ok: true; recognized: false; status: "unclear" | "uncertain"; message: string }
  | { ok: false; error: string };

export function normalizeAnalysis(input: unknown): AnalysisResult {
  const parsed = providerResultSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "Respons AI tidak lengkap atau tidak valid. Silakan coba lagi." };
  const r = parsed.data;
  if (r.imageQuality !== "clear")
    return { ok: true, recognized: false, status: "unclear", message: RETAKE_MESSAGE };
  const objects: RecognizedObject[] = [];
  const unclassified: string[] = [];
  for (const item of r.objects) {
    if (item.confidence !== "high") {
      unclassified.push(item.name);
      continue;
    }
    const status = item.statusConfidence === "high" ? item.status : "UNKNOWN";
    const category = status === "WASTE" && item.categoryConfidence === "high" ? item.category : null;
    const materials = item.materials.confidence === "high"
      ? item.materials
      : { ...item.materials, primary: null, additional: [] };
    objects.push({
      name: item.name, status, materials, category,
      reason: item.reason,
      // Low-confidence status must not expose provider disposal advice as a conclusion.
      tips: item.statusConfidence === "high" ? item.tips : [],
      condition: item.condition?.summary ? item.condition : { summary: CONDITION_UNSURE, residues: [], certain: false, actions: [] },
    });
  }
  if (!objects.length) return { ok: true, recognized: false, status: "uncertain", message: UNCERTAIN_MESSAGE };
  const mixed = r.multipleObjects || objects.length > 1 || unclassified.length > 0;
  return {
    ok: true, recognized: true, objects, mixed, unclassified,
    limitations: mixed
      ? [r.limitations, "Hanya objek yang terlihat jelas dan dikenali dengan yakin yang ditampilkan. Material atau status yang tidak pasti tidak dipaksakan; foto tiap benda secara terpisah untuk hasil lebih rinci."].filter(Boolean).join(" ")
      : r.limitations,
  };
}