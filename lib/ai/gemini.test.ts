import { describe, expect, it } from "vitest";
import { analyzeWithGemini } from "./gemini";

const valid = {platform:{name:"Unknown",confidence:0,evidence:"No platform signal"},summary:"A concise draft.",findings:[],recommendations:[]};
describe("analyzeWithGemini",()=>{
  it("returns structured output from the provider boundary",async()=>{const result=await analyzeWithGemini({text:"A post.",platform:"Unknown"},{apiKey:"test",generateContent:async()=>({text:JSON.stringify(valid)})});expect(result.status).toBe("available");});
  it("falls back for missing keys and malformed responses",async()=>{expect((await analyzeWithGemini({text:"A post.",platform:"Unknown"},{apiKey:undefined})).status).toBe("unavailable");expect((await analyzeWithGemini({text:"A post.",platform:"Unknown"},{apiKey:"test",generateContent:async()=>({text:"not json"})})).status).toBe("failed");});
  it("falls back after a provider timeout",async()=>{const result=await analyzeWithGemini({text:"A post.",platform:"Unknown"},{apiKey:"test",timeoutMs:1,generateContent:async()=>new Promise(() => undefined)});expect(result.status).toBe("failed");});
});
