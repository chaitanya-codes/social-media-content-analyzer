import type { Platform, PlatformDetection } from "@/types/analysis";

const rules: Array<{ platform: Exclude<Platform, "Unknown">; terms: string[]; label: string }> = [
  {platform:"LinkedIn", terms:["linkedin", "celebrate", "recommend", "1st", "2nd", "3rd"], label:"LinkedIn-style profile or interaction language"},
  {platform:"Instagram", terms:["instagram", "reels", "followers", "following", "likes"], label:"Instagram-style profile or engagement language"},
  {platform:"X", terms:["twitter", "x.com", "retweet", "repost", "quote post"], label:"X-style repost or reply language"},
  {platform:"Facebook", terms:["facebook", "friends", "like · reply", "shared a post"], label:"Facebook-style social interaction language"}
];

export function detectPlatform(text: string): PlatformDetection {
  const normalized = text.toLowerCase();
  const matches = rules.map(rule => ({...rule, score:rule.terms.filter(term => normalized.includes(term)).length})).filter(rule => rule.score > 0).sort((a,b)=>b.score-a.score);
  if (!matches.length) return {platform:"Unknown", confidence:0, evidence:"No reliable platform-specific signals were detected."};
  if (matches.length > 1 && matches[0].score === matches[1].score) return {platform:"Unknown", confidence:0.35, evidence:"Platform signals conflict, so no platform was forced."};
  const best = matches[0];
  return {platform:best.platform, confidence:Math.min(0.98, 0.72 + best.score * 0.08), evidence:best.label};
}
