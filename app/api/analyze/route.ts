import { NextResponse } from "next/server";
import pdf from "pdf-parse";
import { createWorker, PSM } from "tesseract.js";
import { analyzeContent } from "@/lib/analysis/analyze";
import { normalizeText } from "@/lib/extraction/normalize";
import { MAX_FILE_SIZE } from "@/lib/validation/files";
import { analyzeWithGemini } from "@/lib/ai/gemini";
import { mergeSemanticAnalysis, resolvePlatform } from "@/lib/ai/merge";
import { detectPlatform } from "@/lib/platform/detect";
export const runtime = "nodejs";
export const maxDuration = 60;
const OCR_TIMEOUT_MS = 25000;
export async function POST(request: Request) {
  try {
    const form = await request.formData(); const file = form.get("file");
    if (!(file instanceof File) || file.size === 0) return NextResponse.json({error:"Choose a file to scan."}, {status:400});
    if (file.size > MAX_FILE_SIZE) return NextResponse.json({error:"That file is larger than 10 MB."}, {status:413});
    const buffer = Buffer.from(await file.arrayBuffer()); let text = ""; let sourceType: "pdf" | "image"; let extractionMethod: "pdf-text" | "ocr"; let extractionQuality: "high" | "medium" | "low" | undefined;
    if (file.type === "application/pdf") { sourceType="pdf"; extractionMethod="pdf-text"; const result = await pdf(buffer); text = normalizeText(result.text || ""); extractionQuality = text.length > 50 ? "high" : "low"; }
    else if (["image/png","image/jpeg","image/webp"].includes(file.type)) { sourceType="image"; extractionMethod="ocr"; const ocr = async () => { const worker = await createWorker("eng"); try { await worker.setParameters({tessedit_pageseg_mode:PSM.AUTO, preserve_interword_spaces:"0"}); return await worker.recognize(buffer); } finally { await worker.terminate(); } }; const result = await Promise.race([ocr(), new Promise<never>((_, reject) => setTimeout(() => reject(new Error("OCR_TIMEOUT")), OCR_TIMEOUT_MS))]); text = normalizeText(result.data.text || ""); extractionQuality = result.data.confidence >= 80 ? "high" : result.data.confidence >= 55 ? "medium" : "low"; }
    else return NextResponse.json({error:"This file type isn't supported."}, {status:415});
    if (!text) return NextResponse.json({error:"No readable text was found. Try a clearer image or a selectable-text PDF."}, {status:422});
    const deterministicAnalysis = analyzeContent(text);
    const deterministicPlatform = detectPlatform(text);
    const semantic = await analyzeWithGemini({text, platform:deterministicPlatform.platform, image:sourceType === "image" && deterministicPlatform.confidence < 0.8 && process.env.GEMINI_API_KEY ? {mimeType:file.type, data:buffer.toString("base64")} : undefined});
    const analysis = semantic.status === "available" ? mergeSemanticAnalysis(deterministicAnalysis, text, semantic.output) : deterministicAnalysis;
    const platformDetection = resolvePlatform(deterministicPlatform, semantic.status === "available" ? semantic.output : undefined);
    return NextResponse.json({filename:file.name.replace(/[^\w. -]/g, ""), sourceType, extractionMethod, extractionQuality, text, platformDetection, semanticAnalysis:{status:semantic.status, ...(semantic.status !== "available" ? {message:semantic.message} : {})}, analysis});
  } catch (caught) { if (caught instanceof Error && caught.message === "OCR_TIMEOUT") return NextResponse.json({error:"The image took too long to read. Try a smaller or clearer screenshot."}, {status:504}); return NextResponse.json({error:"We couldn't scan that file. Check the file and try again."}, {status:500}); }
}
