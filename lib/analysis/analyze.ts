import type { AnalysisResult, ContentEntity, Finding, Recommendation, Signal } from "@/types/analysis";

const words = (text: string) => text.trim() ? text.trim().split(/\s+/) : [];
const sentences = (text: string) => text.split(/[.!?]+/).map(s => s.trim()).filter(Boolean);
const hasAny = (text: string, terms: string[]) => terms.some(t => text.toLowerCase().includes(t));

export function analyzeContent(text: string): AnalysisResult {
  const clean = text.trim(); const ws = words(clean); const ss = sentences(clean); const first = ss[0] || "";
  if (!clean) return {overallScore:0, wordCount:0, characterCount:0, sentenceCount:0, readingTime:"0 min", averageSentenceLength:0, questions:0, ctas:0, hashtags:0, mentions:0, links:0, emojis:0, signals:[], findings:[], entities:[], recommendations:[]};
  const hashtagList = clean.match(/#[\p{L}\d_]+/gu) || []; const mentionList = clean.match(/(?<![\w.+-])@[\w.]+/g) || [];
  const questionCount = (clean.match(/\?/g) || []).length; const ctaCount = hasAny(clean, ["comment", "share", "follow", "save", "tell me", "what do you", "let me know", "reply"]) ? 1 : 0;
  const avg = ss.length ? Math.round(ws.length / ss.length) : 0; const linkCount = (clean.match(/https?:\/\/\S+/g) || []).length; const emojiCount = (clean.match(/[\p{Emoji_Presentation}\uFE0F]/gu) || []).length;
  const entities: ContentEntity[] = [];
  const addEntities = (type: ContentEntity["type"], regex: RegExp, detail: string, count: number) => { for (const match of clean.matchAll(regex)) { const textValue = match[0]; const startIndex = match.index ?? -1; if (startIndex >= 0) entities.push({id:`${type}-${startIndex}`, type, text:textValue, startIndex, endIndex:startIndex + textValue.length, detail, count}); } };
  addEntities("hashtag", /#[\p{L}\d_]+/gu, "Relevant hashtag found in the post.", hashtagList.length);
  addEntities("mention", /(?<![\w.+-])@[\w.]+/g, "Mention detected; this may direct attention to another account.", mentionList.length);
  addEntities("link", /https?:\/\/\S+/g, "Link detected in the post.", linkCount);
  for (const match of clean.matchAll(/\?/g)) { const questionIndex = match.index ?? -1; const context = clean.slice(Math.max(0, questionIndex - 200), questionIndex); if (questionIndex < 0 || /https?:\/\/\S*$/.test(context)) continue; const startIndex = Math.max(context.lastIndexOf("\n"), context.lastIndexOf("."), context.lastIndexOf("—")) + 1; const textValue = clean.slice(Math.max(0, questionIndex - context.length + startIndex), questionIndex + 1).trim(); const actualStart = clean.indexOf(textValue, Math.max(0, questionIndex - context.length)); if (textValue) entities.push({id:`question-${questionIndex}`, type:"question", text:textValue, startIndex:actualStart, endIndex:actualStart + textValue.length, detail:"Question detected; this may encourage reader participation.", count:questionCount}); }
  addEntities("emoji", /\p{Extended_Pictographic}/gu, "Emoji detected; it contributes a visual tone cue.", emojiCount);
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
  const findings: Finding[] = [];
  const firstStart = clean.indexOf(first);
  if (hookScore < 75 && first) findings.push({id:"hook-opening", category:"Hook", severity:"attention", message:"The opening could create more pull.", explanation:"Readers meet the main idea, but the first line could give them a sharper reason to continue.", startIndex:firstStart, endIndex:firstStart + first.length, originalText:first, canApplyFix:false});
  if (!ctaCount) findings.push({id:"cta-missing", category:"CTA", severity:"attention", message:"No clear invitation to respond.", explanation:"A specific question gives readers a direct way into the conversation.", startIndex:clean.length, endIndex:clean.length, originalText:"", suggestedText:"\n\nWhat part of this would you approach differently?", canApplyFix:true});
  if (avg > 22) {
    const longSentence = ss.reduce((longest, current) => current.length > longest.length ? current : longest, "");
    const longStart = clean.indexOf(longSentence);
    findings.push({id:"long-sentence", category:"Readability", severity:"attention", message:"One sentence is doing too much work.", explanation:`This sentence is ${words(longSentence).length} words long. More white space would make the idea easier to scan.`, startIndex:longStart, endIndex:longStart + longSentence.length, originalText:longSentence, canApplyFix:false});
  }
  if (hashtagList.length > 5) {
    const tagStart = clean.indexOf(hashtagList[5]); const tagEnd = hashtagList.reduce((end, tag) => clean.indexOf(tag, end), tagStart) + hashtagList[hashtagList.length - 1].length;
    findings.push({id:"hashtag-set", category:"Hashtags", severity:"attention", message:"The hashtag set is crowded.", explanation:`${hashtagList.length} hashtags compete with the post. Keeping the first five is a safe, reversible edit.`, startIndex:tagStart, endIndex:tagEnd, originalText:clean.slice(tagStart, tagEnd), suggestedText:hashtagList.slice(0, 5).join(" "), canApplyFix:true});
  }
  const recommendations: Recommendation[] = [];
  if (hookScore < 75) recommendations.push({category:"Hook", title:"Bring the point forward", explanation:`Your opening uses ${first ? ws.slice(0, Math.min(8, ws.length)).length : 0} words before establishing the idea.`, action:"Lead with the most surprising claim, result or question.", tone:"focus"});
  if (!ctaCount) recommendations.push({category:"CTA", title:"Give the reader a way in", explanation:"The post ends without a clear invitation to respond.", action:"End with one specific question related to your main point.", tone:"focus"});
  if (avg > 22) recommendations.push({category:"Readability", title:"Create more white space", explanation:`Your sentences average ${avg} words, which can slow down scanning.`, action:"Split the longest sentence into two shorter thoughts.", tone:"focus"});
  if (hashtagList.length > 5) recommendations.push({category:"Hashtags", title:"Edit the tag set", explanation:`${hashtagList.length} hashtags were detected.`, action:"Keep the three to five tags most closely tied to the post.", tone:"neutral"});
  if (questionCount || ctaCount) recommendations.push({category:"Interaction", title:"Conversation signal detected", explanation:"Your post already gives readers a reason to participate.", action:"Keep the prompt specific and easy to answer.", tone:"positive"});
  if (!recommendations.length) recommendations.push({category:"Clarity", title:"Keep the structure", explanation:"The core signals are balanced and readable.", action:"Preserve this rhythm as you refine the wording.", tone:"positive"});
  const improvedDraft = !clean ? undefined : (ctaCount ? clean : `${clean}\n\nWhat part of this would you approach differently?`);
  findings.forEach(finding => { finding.source = "deterministic"; });
  entities.sort((a,b)=>a.startIndex-b.startIndex || (a.type === "question" ? 1 : -1));
  return {overallScore, wordCount:ws.length, characterCount:clean.length, sentenceCount:ss.length, readingTime:`${Math.max(1, Math.ceil(ws.length / 200))} min`, averageSentenceLength:avg, questions:questionCount, ctas:ctaCount, hashtags:hashtagList.length, mentions:mentionList.length, links:linkCount, emojis:emojiCount, signals, findings, entities, recommendations, improvedDraft};
}
