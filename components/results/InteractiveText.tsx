"use client";
import type { Finding } from "@/types/analysis";

interface Props { text: string; findings: Finding[]; activeId?: string; onSelect: (finding: Finding) => void; }

export function InteractiveText({text, findings, activeId, onSelect}: Props) {
  const ranges = findings.filter(f => typeof f.startIndex === "number" && typeof f.endIndex === "number" && f.endIndex! > f.startIndex!);
  if (!ranges.length) return <span>{text}</span>;
  const boundaries = Array.from(new Set([0, text.length, ...ranges.flatMap(f => [f.startIndex!, f.endIndex!])])).sort((a,b)=>a-b);
  return <>{boundaries.slice(0, -1).map((start, index) => { const end = boundaries[index + 1]; const finding = ranges.find(f => f.startIndex! <= start && f.endIndex! >= end); if (!finding) return <span key={`${start}-${end}`}>{text.slice(start,end)}</span>; return <button type="button" key={`${start}-${end}`} aria-label={`${finding.category}: ${finding.message}`} aria-pressed={activeId === finding.id} onClick={() => onSelect(finding)} onKeyDown={event => { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); onSelect(finding); } }} className={`finding-highlight focus-ring ${activeId === finding.id ? "finding-active" : ""}`}>{text.slice(start,end)}</button>; })}</>;
}
