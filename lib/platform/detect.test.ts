import { describe, expect, it } from "vitest";
import { detectPlatform } from "./detect";
describe("detectPlatform",()=>{
  it("recognizes strong platform language",()=>{expect(detectPlatform("LinkedIn · 1st · Celebrate · Recommend").platform).toBe("LinkedIn");expect(detectPlatform("Instagram · 4 likes · 120 followers").platform).toBe("Instagram");expect(detectPlatform("Repost · Quote post · Reply").platform).toBe("X");expect(detectPlatform("Facebook · Friends · Like · Reply").platform).toBe("Facebook");});
  it("does not force an ambiguous or unknown platform",()=>{expect(detectPlatform("A plain social post with no interface clues").platform).toBe("Unknown");expect(detectPlatform("LinkedIn Instagram").platform).toBe("Unknown");});
});
