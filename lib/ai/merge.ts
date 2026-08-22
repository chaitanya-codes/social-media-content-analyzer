import type { AnalysisCategory, AnalysisResult, Finding, Platform, PlatformDetection, Recommendation } from "@/types/analysis";
import type { GeminiOutput } from "./gemini";

const categories: AnalysisCategory[] = ["Hook","Clarity","Readability","CTA","Interaction","Hashtags"];
const platforms: Platform[] = ["Instagram","LinkedIn","X","Facebook","Unknown"];
const isCategory = (value: string): value is AnalysisCategory => categories.includes(value as AnalysisCategory);

export function mergeSemanticAnalysis(base: AnalysisResult, text: string, output: GeminiOutput): AnalysisResult {
  const additions: Finding[] = [];
  output.findings.forEach((item, index) => {
    if (!isCategory(item.category) || !["attention","info"].includes(item.severity) || !item.message || !item.explanation) return;
    const evidence = typeof item.evidence === "string" && item.evidence ? item.evidence : undefined;
    const startIndex = evidence ? text.indexOf(evidence) : -1;
    if (evidence && startIndex < 0) return;
    const hasRange = startIndex >= 0;
    additions.push({id:`gemini-${index}-${item.category.toLowerCase()}`, category:item.category, severity:item.severity as Finding["severity"], message:item.message, explanation:item.explanation, startIndex:hasRange?startIndex:undefined, endIndex:hasRange?startIndex + evidence!.length:undefined, originalText:evidence, suggestedText:hasRange && item.suggestedReplacement ? item.suggestedReplacement : undefined, canApplyFix:hasRange && Boolean(item.suggestedReplacement), source:"gemini"});
  });
  const deduped = additions.filter(addition => !base.findings.some(existing => existing.category===addition.category && existing.originalText && addition.originalText && existing.originalText===addition.originalText));
  const recommendations: Recommendation[] = output.recommendations.filter(item => isCategory(item.category) && item.title && item.explanation && item.action).slice(0,4).map(item=>({category:item.category as AnalysisCategory,title:item.title,explanation:item.explanation,action:item.action,tone:"neutral"}));
  return {...base, findings:[...base.findings,...deduped], recommendations:[...base.recommendations,...recommendations].slice(0,8)};
}

export function resolvePlatform(deterministic: PlatformDetection, output?: GeminiOutput): PlatformDetection {
  if (deterministic.platform !== "Unknown" && deterministic.confidence >= 0.8) return deterministic;
  if (!output || !platforms.includes(output.platform.name as Platform) || output.platform.confidence < 0.5) return deterministic;
  return {platform:output.platform.name as Platform, confidence:Math.min(0.99, Math.max(0, output.platform.confidence)), evidence:output.platform.evidence};
}
