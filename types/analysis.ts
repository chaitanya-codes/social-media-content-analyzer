export type AnalysisCategory = "Hook" | "Clarity" | "Readability" | "CTA" | "Interaction" | "Hashtags";
export type Quality = "high" | "medium" | "low";
export interface Signal { category: AnalysisCategory; score: number; status: "strong" | "steady" | "needs work"; explanation: string; evidence?: string; }
export type FindingSeverity = "info" | "attention";
export interface Finding { id: string; category: AnalysisCategory; severity: FindingSeverity; message: string; explanation: string; startIndex?: number; endIndex?: number; originalText?: string; suggestedText?: string; canApplyFix: boolean; }
export interface Recommendation { category: AnalysisCategory; title: string; explanation: string; action: string; tone: "positive" | "neutral" | "focus"; }
export interface AnalysisResult { overallScore: number; wordCount: number; characterCount: number; sentenceCount: number; readingTime: string; averageSentenceLength: number; questions: number; ctas: number; hashtags: number; mentions: number; links: number; emojis: number; signals: Signal[]; findings: Finding[]; recommendations: Recommendation[]; improvedDraft?: string; }
export interface AnalysisResponse { filename: string; sourceType: "pdf" | "image"; extractionMethod: "pdf-text" | "ocr"; extractionQuality?: Quality; text: string; analysis: AnalysisResult; }
