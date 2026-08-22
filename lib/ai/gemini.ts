import { GoogleGenAI, Type } from "@google/genai";
import type { Platform } from "@/types/analysis";

export interface GeminiImage { mimeType: string; data: string; }
export interface GeminiInput { text: string; platform: Platform; image?: GeminiImage; }
export interface SemanticFinding { category: string; severity: string; message: string; explanation: string; evidence?: string; suggestedImprovement?: string; suggestedReplacement?: string; }
export interface SemanticRecommendation { category: string; title: string; explanation: string; action: string; }
export interface GeminiOutput { platform: { name: string; confidence: number; evidence: string }; summary: string; findings: SemanticFinding[]; recommendations: SemanticRecommendation[]; }
export type GeminiResult = { status: "available"; output: GeminiOutput } | { status: "unavailable" | "failed"; message: string };
type GenerateContent = (request: {model: string; contents: unknown; config: unknown}) => Promise<{text?: string}>;

const model = () => process.env.GEMINI_MODEL || "gemini-2.5-flash";
const schema = {type:Type.OBJECT, properties:{platform:{type:Type.OBJECT, properties:{name:{type:Type.STRING, enum:["Instagram","LinkedIn","X","Facebook","Unknown"]}, confidence:{type:Type.NUMBER}, evidence:{type:Type.STRING}}, required:["name","confidence","evidence"]}, summary:{type:Type.STRING}, findings:{type:Type.ARRAY, items:{type:Type.OBJECT, properties:{category:{type:Type.STRING}, severity:{type:Type.STRING}, message:{type:Type.STRING}, explanation:{type:Type.STRING}, evidence:{type:Type.STRING}, suggestedImprovement:{type:Type.STRING}, suggestedReplacement:{type:Type.STRING}}, required:["category","severity","message","explanation"]}}, recommendations:{type:Type.ARRAY, items:{type:Type.OBJECT, properties:{category:{type:Type.STRING}, title:{type:Type.STRING}, explanation:{type:Type.STRING}, action:{type:Type.STRING}}, required:["category","title","explanation","action"]}}}, required:["platform","summary","findings","recommendations"]};

const prompt = (input: GeminiInput) => `You are the semantic layer for a content analysis tool. Analyze the post below using the platform context. Do not calculate simple counts. Return only meaningful semantic findings and recommendations. Evidence must be an exact substring of the post. Never invent quotes. Only provide suggestedReplacement when the replacement is short, safe, and directly tied to the evidence. Do not rewrite the whole post. Platform context: ${input.platform}.\n\nPOST:\n<<<\n${input.text}\n>>>`;

function validOutput(value: unknown): value is GeminiOutput { if (!value || typeof value !== "object") return false; const candidate = value as Record<string, unknown>; const platform = candidate.platform as Record<string, unknown> | undefined; return !!platform && typeof platform.name === "string" && typeof platform.confidence === "number" && typeof platform.evidence === "string" && typeof candidate.summary === "string" && Array.isArray(candidate.findings) && Array.isArray(candidate.recommendations); }

export async function analyzeWithGemini(input: GeminiInput, options: {apiKey?: string; generateContent?: GenerateContent; timeoutMs?: number} = {}): Promise<GeminiResult> {
  const apiKey = options.apiKey ?? process.env.GEMINI_API_KEY;
  if (!apiKey && !options.generateContent) return {status:"unavailable", message:"Semantic analysis is unavailable. Basic analysis is still available."};
  try {
    const generateContent = options.generateContent || ((request) => { const client = new GoogleGenAI({apiKey}); return client.models.generateContent(request as never) as Promise<{text?: string}>; });
    const contents = [{role:"user", parts:[{text:prompt(input)}, ...(input.image ? [{inlineData:{mimeType:input.image.mimeType, data:input.image.data}}] : [])]}];
    const request = generateContent({model:model(), contents, config:{responseMimeType:"application/json", responseSchema:schema, temperature:0.2}});
    const response = await Promise.race([request, new Promise<never>((_, reject) => setTimeout(() => reject(new Error("timeout")), options.timeoutMs ?? 18000))]);
    if (!response.text) throw new Error("empty response");
    const parsed: unknown = JSON.parse(response.text); if (!validOutput(parsed)) throw new Error("invalid response");
    return {status:"available", output:parsed};
  } catch { return {status:"failed", message:"Semantic analysis is unavailable. Basic analysis is still available."}; }
}
