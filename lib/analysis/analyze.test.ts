import { describe, expect, it } from "vitest";
import { analyzeContent } from "./analyze";
describe("analyzeContent",()=>{
  it("counts content signals",()=>{const result=analyzeContent("A clear hook! What do you think? #writing @postlens https://example.com");expect(result.wordCount).toBe(10);expect(result.questions).toBe(1);expect(result.hashtags).toBe(1);expect(result.mentions).toBe(1);expect(result.links).toBe(1);});
  it("recommends a CTA when one is absent",()=>{const result=analyzeContent("A short statement about a useful idea.");expect(result.recommendations.some(r=>r.category==="CTA")).toBe(true);});
  it("handles empty input",()=>{const result=analyzeContent("");expect(result.wordCount).toBe(0);expect(result.overallScore).toBe(0);});
});
