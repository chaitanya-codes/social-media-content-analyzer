import type { AnalysisResult, Recommendation, Signal } from "@/types/analysis";

const words = (text: string) => text.trim() ? text.trim().split(/\s+/) : [];
const sentences = (text: string) => text.split(/[.!?]+/).map(s => s.trim()).filter(Boolean);
const hasAny = (text: string, terms: string[]) => terms.some(t => text.toLowerCase().includes(t));

export function analyzeContent(text: string): AnalysisResult {
  const clean = text.trim(); const ws = words(clean); const ss = sentences(clean); const first = ss[0] || "";
  if (!clean) return {overallScore:0, wordCount:0, characterCount:0, sentenceCount:0, readingTime:"0 min", averageSentenceLength:0, questions:0, ctas:0, hashtags:0, mentions:0, links:0, emojis:0, signals:[], recommendations:[]};
  const hashtagList = clean.match(/#[\p{L}\d_]+/gu) || []; const mentionList = clean.match(/@[\w.]+/g) || [];
  const questionCount = (clean.match(/\?/g) || []).length; const ctaCount = hasAny(clean, ["comment", "share", "follow", "save", "tell me", "what do you", "let me know", "reply"]) ? 1 : 0;
  const avg = ss.length ? Math.round(ws.length / ss.length) : 0; const linkCount = (clean.match(/https?:\/\/\S+/g) || []).length; const emojiCount = (clean.match(/[\p{Emoji_Presentation}\uFE0F]/gu) || []).length;
  const hookScore = !first ? 0 : Math.min(96, 45 + (first.length < 100 ? 18 : 0) + (/\?|!|\d/.test(first) ? 15 : 0) + (ws.length > 20 ? 8 : 0));
  const clarity = !clean ? 0 : Math.max(35, Math.min(96, 92 - Math.max(0, avg - 20) * 2 - (clean.length > 1200 ? 12 : 0)));
  const readability = !clean ? 0 : Math.max(30, Math.min(96, 94 - Math.max(0, avg - 14) * 3 - (ss.length === 1 && ws.length > 35 ? 8 : 0)));
  const ctaScore = ctaCount ? 86 : 38; const interaction = questionCount ? Math.min(96, 68 + questionCount * 8) : ctaCount ? 62 : 34;
  const hashtagScore = hashtagList.length === 0 ? 58 : hashtagList.length <= 5 ? 88 : 48;
  const signals: Signal[] = [
    {category:"Hook", score:hookScore, status:hookScore >= 75 ? "strong" : hookScore >= 55 ? "steady" : "needs work", explanation: hookScore >= 75 ? "The opening gets to a clear idea quickly." : "The opening could create more tension or curiosity.", evidence:first ? `“${first.slice(0, 100)}${first.length > 100 ? "…" : ""}”` : undefined},
    {category:"Clarity", score:clarity, status:clarity >= 75 ? "strong" : clarity >= 55 ? "steady" : "needs work", explanation: clarity >= 75 ? "The central thought is easy to follow." : "Long phrasing may make the central thought harder to scan."},
    {category:"Readability", score:readability, status:readability >= 75 ? "strong" : readability >= 55 ? "steady" : "needs work", explanation:readability >= 75 ? "Sentence length supports a comfortable reading rhythm." : "Shorter sentences would create more breathing room."},
    {category:"CTA", score:ctaScore, status:ctaScore >= 75 ? "strong" : "needs work", explanation:ctaCount ? "The post gives readers a clear next step." : "There is no direct invitation to respond."},
    {category:"Interaction", score:interaction, status:interaction >= 75 ? "strong" : interaction >= 55 ? "steady" : "needs work", explanation:questionCount ? "A question creates a natural opening for discussion." : "A prompt or question could make the post more conversational."},
    {category:"Hashtags", score:hashtagScore, status:hashtagScore >= 75 ? "strong" : hashtagScore >= 55 ? "steady" : "needs work", explanation:hashtagList.length > 5 ? "The hashtag set may compete with the main idea." : hashtagList.length ? "Hashtags are present without overwhelming the copy." : "No hashtags detected; add only relevant ones if discovery matters."}
  ];
  const overallScore = Math.round(signals.reduce((sum, s) => sum + s.score, 0) / signals.length);
  const recommendations: Recommendation[] = [];
  if (hookScore < 75) recommendations.push({category:"Hook", title:"Bring the point forward", explanation:`Your opening uses ${first ? ws.slice(0, Math.min(8, ws.length)).length : 0} words before establishing the idea.`, action:"Lead with the most surprising claim, result or question.", tone:"focus"});
  if (!ctaCount) recommendations.push({category:"CTA", title:"Give the reader a way in", explanation:"The post ends without a clear invitation to respond.", action:"End with one specific question related to your main point.", tone:"focus"});
  if (avg > 22) recommendations.push({category:"Readability", title:"Create more white space", explanation:`Your sentences average ${avg} words, which can slow down scanning.`, action:"Split the longest sentence into two shorter thoughts.", tone:"focus"});
  if (hashtagList.length > 5) recommendations.push({category:"Hashtags", title:"Edit the tag set", explanation:`${hashtagList.length} hashtags were detected.`, action:"Keep the three to five tags most closely tied to the post.", tone:"neutral"});
  if (questionCount || ctaCount) recommendations.push({category:"Interaction", title:"Conversation signal detected", explanation:"Your post already gives readers a reason to participate.", action:"Keep the prompt specific and easy to answer.", tone:"positive"});
  if (!recommendations.length) recommendations.push({category:"Clarity", title:"Keep the structure", explanation:"The core signals are balanced and readable.", action:"Preserve this rhythm as you refine the wording.", tone:"positive"});
  const improvedDraft = !clean ? undefined : (ctaCount ? clean : `${clean}\n\nWhat part of this would you approach differently?`);
  return {overallScore, wordCount:ws.length, characterCount:clean.length, sentenceCount:ss.length, readingTime:`${Math.max(1, Math.ceil(ws.length / 200))} min`, averageSentenceLength:avg, questions:questionCount, ctas:ctaCount, hashtags:hashtagList.length, mentions:mentionList.length, links:linkCount, emojis:emojiCount, signals, recommendations, improvedDraft};
}
