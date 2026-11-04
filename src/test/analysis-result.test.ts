import { describe, expect, it } from "vitest";
import { normalizeAnalysis } from "@/lib/analysis-result";

const object = { name: "Botol plastik", isWaste: true, confidence: "high", category: "plastik", reason: "Botol PET buangan terlihat jelas", tips: ["Bilas", "Pisahkan tutup"] };
const response = { status: "waste", imageQuality: "clear", containsWaste: true, multipleObjects: false, objects: [object], limitations: "" };
describe("AI waste safeguards", () => {
  it.each(["hewan", "manusia", "kendaraan", "pemandangan", "benda non-sampah"])("rejects %s even if model also supplies a category", (name) => {
    const result = normalizeAnalysis({ ...response, status: "non_waste", objects: [{ ...object, name }] });
    expect(result).toMatchObject({ ok: true, recognized: false, status: "non_waste" });
    expect(result).not.toHaveProperty("category");
  });
  it.each(["blurred", "dark", "obscured"])("requires a retake for %s photos even with waste classification", (imageQuality) => {
    expect(normalizeAnalysis({ ...response, imageQuality })).toMatchObject({ recognized: false, status: "unclear" });
  });
  it.each(["medium", "low"])("does not force %s confidence classifications", (confidence) => {
    expect(normalizeAnalysis({ ...response, objects: [{ ...object, confidence }] })).toMatchObject({ recognized: false, status: "uncertain" });
  });
  it("does not classify when waste relevance is uncertain", () => {
    expect(normalizeAnalysis({ ...response, status: "uncertain" })).toMatchObject({ recognized: false, status: "uncertain" });
    expect(normalizeAnalysis({ ...response, containsWaste: false })).toMatchObject({ recognized: false });
  });
  it("keeps every confidently identified mixed-waste object with its own category and limitations", () => {
    const result = normalizeAnalysis({ ...response, multipleObjects: true, objects: [object, { ...object, name: "Kardus", category: "kertas" }], limitations: "Bagian belakang tertutup." });
    expect(result).toMatchObject({ recognized: true, mixed: true, objects: [{ category: "plastik" }, { category: "kertas" }] });
    if (result.ok && result.recognized) expect(result.limitations).toContain("Bagian belakang tertutup.");
  });
  it("leaves uncertain mixed-waste items unclassified", () => {
    const result = normalizeAnalysis({ ...response, objects: [object, { ...object, name: "Kemasan campuran", confidence: "low", category: "tidak_dikenali" }] });
    expect(result).toMatchObject({ mixed: true, unclassified: ["Kemasan campuran"], objects: [objectWithoutFlags()] });
  });
  it("never categorizes a non-waste object inside a waste scene", () => {
    expect(normalizeAnalysis({ ...response, objects: [{ ...object, isWaste: false }] })).toMatchObject({ recognized: false });
  });
  it("rejects empty, malformed or unsupported AI results instead of fabricating success", () => {
    for (const input of [null, {}, { ...response, objects: [{ ...object, category: "kendaraan" }] }]) {
      expect(normalizeAnalysis(input)).toMatchObject({ ok: false });
    }
    expect(normalizeAnalysis({ ...response, objects: [] })).toMatchObject({ recognized: false });
  });
  it.each(["organik", "plastik", "kertas", "kaca", "logam"])("accepts clear high-confidence %s from the actual provider payload", (category) => {
    expect(normalizeAnalysis({ ...response, objects: [{ ...object, category }] })).toMatchObject({ recognized: true, category });
  });
});
function objectWithoutFlags() {
  return { name: object.name, category: object.category, reason: object.reason, tips: object.tips };
}