import { NextResponse } from "next/server";
import pdf from "pdf-parse";
import { createWorker } from "tesseract.js";
import { analyzeContent } from "@/lib/analysis/analyze";
import { normalizeText } from "@/lib/extraction/normalize";
import { MAX_FILE_SIZE } from "@/lib/validation/files";
export const runtime = "nodejs";
export async function POST(request: Request) {
  try {
    const form = await request.formData(); const file = form.get("file");
    if (!(file instanceof File) || file.size === 0) return NextResponse.json({error:"Choose a file to scan."}, {status:400});
    if (file.size > MAX_FILE_SIZE) return NextResponse.json({error:"That file is larger than 10 MB."}, {status:413});
    const buffer = Buffer.from(await file.arrayBuffer()); let text = ""; let sourceType: "pdf" | "image"; let extractionMethod: "pdf-text" | "ocr"; let extractionQuality: "high" | "medium" | "low" | undefined;
    if (file.type === "application/pdf") { sourceType="pdf"; extractionMethod="pdf-text"; const result = await pdf(buffer); text = normalizeText(result.text || ""); extractionQuality = text.length > 50 ? "high" : "low"; }
    else if (["image/png","image/jpeg","image/webp"].includes(file.type)) { sourceType="image"; extractionMethod="ocr"; const worker = await createWorker("eng"); const result = await worker.recognize(buffer); text = normalizeText(result.data.text || ""); extractionQuality = result.data.confidence >= 80 ? "high" : result.data.confidence >= 55 ? "medium" : "low"; await worker.terminate(); }
    else return NextResponse.json({error:"This file type isn't supported."}, {status:415});
    if (!text) return NextResponse.json({error:"No readable text was found. Try a clearer image or a selectable-text PDF."}, {status:422});
    return NextResponse.json({filename:file.name.replace(/[^\w. -]/g, ""), sourceType, extractionMethod, extractionQuality, text, analysis:analyzeContent(text)});
  } catch { return NextResponse.json({error:"We couldn't scan that file. Check the file and try again."}, {status:500}); }
}
