"use client";
import type { ContentEntity, Finding } from "@/types/analysis";

interface Props { text: string; findings: Finding[]; entities: ContentEntity[]; activeId?: string; onSelect: (annotation: Finding | ContentEntity) => void; enabled: boolean; }

export function InteractiveText({text, findings, entities, activeId, onSelect, enabled}: Props) {
  if (!enabled) return <span>{text}</span>;
  const ranges = findings.filter(f => typeof f.startIndex === "number" && typeof f.endIndex === "number" && f.startIndex! >= 0 && f.endIndex! <= text.length && f.endIndex! > f.startIndex!);
  const rangesWithKind = [...ranges.map(finding => ({...finding, kind:"finding" as const})), ...entities.filter(entity => entity.startIndex >= 0 && entity.endIndex <= text.length && entity.endIndex > entity.startIndex).map(entity => ({...entity, kind:"entity" as const}))];
  if (!rangesWithKind.length) return <span>{text}</span>;
  const boundaries = Array.from(new Set([0, text.length, ...rangesWithKind.flatMap(annotation => [annotation.startIndex!, annotation.endIndex!])])).sort((a,b)=>a-b);
  return <>{boundaries.slice(0, -1).map((start, index) => { const end = boundaries[index + 1]; const candidates = rangesWithKind.filter(annotation => annotation.startIndex! <= start && annotation.endIndex! >= end); const annotation = candidates.sort((a,b) => a.kind === b.kind ? 0 : a.kind === "finding" ? -1 : 1)[0]; if (!annotation) return <span key={`${start}-${end}`}>{text.slice(start,end)}</span>; const label = annotation.kind === "finding" ? `${annotation.category}: ${annotation.message}` : `${annotation.type}: ${annotation.text}`; return <button type="button" key={`${start}-${end}`} aria-label={label} aria-pressed={activeId === annotation.id} onClick={() => onSelect(annotation)} className={`${annotation.kind === "finding" ? "finding-highlight" : `entity-highlight entity-${annotation.type}`} focus-ring ${activeId === annotation.id ? "finding-active" : ""}`}>{text.slice(start,end)}</button>; })}</>;
}
