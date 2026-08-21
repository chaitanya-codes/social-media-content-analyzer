import { describe, expect, it } from "vitest";
import { normalizeText } from "./normalize";
describe("normalizeText",()=>{it("keeps paragraph breaks while collapsing OCR whitespace",()=>{expect(normalizeText("  Hello   world\r\n\r\n\r\nNext   line  ")).toBe("Hello world\n\nNext line");});});
