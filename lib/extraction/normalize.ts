export function normalizeText(value: string) { return value.replace(/\r\n/g, "\n").split("\n").map(line => line.replace(/[ \t]+/g, " ").trim()).join("\n").replace(/\n{3,}/g, "\n\n").trim(); }
