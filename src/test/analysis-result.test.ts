import { describe, expect, it } from "vitest";
import { CONDITION_UNSURE, normalizeAnalysis, RETAKE_MESSAGE, UNCERTAIN_MESSAGE } from "@/lib/analysis-result";

const object = {
  name: "Botol plastik",
  confidence: "high",
  status: "WASTE",
  statusConfidence: "high",
  materials: { primary: "Plastik PET", additional: ["Tutup plastik"], confidence: "high" },
  category: "plastik",
  categoryConfidence: "high",
  reason: "Botol PET buangan terlihat jelas",
  tips: ["Bilas", "Pisahkan tutup"],
  condition: { summary: "Botol kosong dan bersih.", residues: [], certain: true, actions: ["Bilas sebelum disetor"] },
};
const response = { imageQuality: "clear", multipleObjects: false, objects: [object], limitations: "" };

describe("AI waste safeguards", () => {
  it.each(["blurred", "dark", "obscured"])("requires a retake for %s photos even with waste classification", (imageQuality) => {
    expect(normalizeAnalysis({ ...response, imageQuality })).toMatchObject({ ok: true, recognized: false, status: "unclear", message: RETAKE_MESSAGE });
  });
  it.each(["medium", "low"])("does not force %s confidence classifications", (confidence) => {
    const result = normalizeAnalysis({ ...response, objects: [{ ...object, confidence }] });
    expect(result).toMatchObject({ ok: true, recognized: false, status: "uncertain", message: UNCERTAIN_MESSAGE });
  });
  it("marks low-confidence status as UNKNOWN without a category or disposal tips", () => {
    const result = normalizeAnalysis({ ...response, objects: [{ ...object, statusConfidence: "low" }] });
    expect(result).toMatchObject({ recognized: true, objects: [{ status: "UNKNOWN", category: null, tips: [] }] });
  });
  it("keeps recognized everyday non-waste objects visible as NON_WASTE without a category", () => {
    const result = normalizeAnalysis({ ...response, objects: [{ ...object, name: "Kursi kayu", status: "NON_WASTE", category: null }] });
    expect(result).toMatchObject({ recognized: true, objects: [{ name: "Kursi kayu", status: "NON_WASTE", category: null }] });
  });
  it("withholds materials and category when their confidence is not high", () => {
    const result = normalizeAnalysis({ ...response, objects: [{ ...object, materials: { ...object.materials, confidence: "medium" }, categoryConfidence: "low" }] });
    expect(result).toMatchObject({ recognized: true, objects: [{ category: null, materials: { primary: null, additional: [] } }] });
  });
  it("keeps every confidently identified mixed-waste object with its own category and limitations", () => {
    const result = normalizeAnalysis({ ...response, multipleObjects: true, objects: [object, { ...object, name: "Kardus", category: "kertas" }], limitations: "Bagian belakang tertutup." });
    expect(result).toMatchObject({ recognized: true, mixed: true, objects: [{ category: "plastik" }, { category: "kertas" }] });
    if (result.ok && result.recognized) expect(result.limitations).toContain("Bagian belakang tertutup.");
  });
  it("leaves uncertain mixed-waste items unclassified", () => {
    const result = normalizeAnalysis({ ...response, objects: [object, { ...object, name: "Kemasan campuran", confidence: "low" }] });
    expect(result).toMatchObject({ recognized: true, mixed: true, unclassified: ["Kemasan campuran"], objects: [{ name: "Botol plastik" }] });
  });
  it("rejects empty, malformed or unsupported AI results instead of fabricating success", () => {
    for (const input of [null, {}, { ...response, objects: [{ ...object, status: "MAYBE" }] }]) {
      expect(normalizeAnalysis(input)).toMatchObject({ ok: false });
    }
    expect(normalizeAnalysis({ ...response, objects: [] })).toMatchObject({ recognized: false });
  });
  it("adds an unsure condition note when the model omits condition details", () => {
    const { condition, ...noCondition } = object;
    const result = normalizeAnalysis({ ...response, objects: [noCondition] });
    expect(result).toMatchObject({ recognized: true, objects: [{ condition: { summary: CONDITION_UNSURE, certain: false } }] });
  });
  it.each(["organik", "plastik", "kertas", "kaca", "logam"])("accepts clear high-confidence %s from the actual provider payload", (category) => {
    expect(normalizeAnalysis({ ...response, objects: [{ ...object, category }] })).toMatchObject({ recognized: true, objects: [{ category }] });
  });
});
