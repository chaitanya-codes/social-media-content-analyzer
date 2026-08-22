export type AnalysisCategory = "Hook" | "Clarity" | "Readability" | "CTA" | "Interaction" | "Hashtags";
export type Quality = "high" | "medium" | "low";
export type Platform = "Instagram" | "LinkedIn" | "X" | "Facebook" | "Unknown";
export interface PlatformDetection { platform: Platform; confidence: number; evidence: string; }
export interface SemanticAnalysisStatus { status: "available" | "unavailable" | "failed"; message?: string; }
export interface Signal { category: AnalysisCategory; score: number; status: "strong" | "steady" | "needs work"; explanation: string; evidence?: string; }
export type FindingSeverity = "info" | "attention";
export interface Finding { id: string; category: AnalysisCategory; severity: FindingSeverity; message: string; explanation: string; startIndex?: number; endIndex?: number; originalText?: string; suggestedText?: string; canApplyFix: boolean; source?: "deterministic" | "gemini"; }
export type ContentEntityType = "hashtag" | "mention" | "link" | "question" | "emoji";
export interface ContentEntity { id: string; type: ContentEntityType; text: string; startIndex: number; endIndex: number; detail: string; count: number; }
export interface Recommendation { category: AnalysisCategory; title: string; explanation: string; action: string; tone: "positive" | "neutral" | "focus"; }
export interface AnalysisResult { overallScore: number; wordCount: number; characterCount: number; sentenceCount: number; readingTime: string; averageSentenceLength: number; questions: number; ctas: number; hashtags: number; mentions: number; links: number; emojis: number; signals: Signal[]; findings: Finding[]; entities: ContentEntity[]; recommendations: Recommendation[]; improvedDraft?: string; }
export interface AnalysisResponse { filename: string; sourceType: "pdf" | "image"; extractionMethod: "pdf-text" | "ocr"; extractionQuality?: Quality; text: string; platformDetection?: PlatformDetection; semanticAnalysis?: SemanticAnalysisStatus; analysis: AnalysisResult; }
