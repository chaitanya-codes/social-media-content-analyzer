"use client";
import type { Finding } from "@/types/analysis";

interface Props { finding?: Finding; onFix: (finding: Finding) => void; onClose: () => void; }
export function FindingDetails({finding, onFix, onClose}: Props) {
  if (!finding) return null;
  return <aside aria-live="polite" className="finding-panel mt-5 border border-[var(--line)] bg-[var(--panel)] p-5"><div className="flex items-start justify-between gap-4"><div><div className="mono text-[10px] text-[var(--accent)]">{finding.category.toUpperCase()} / {finding.severity === "attention" ? "NEEDS ATTENTION" : "SIGNAL"}</div><h3 className="mt-3 text-lg">{finding.message}</h3></div><button type="button" aria-label="Close finding details" onClick={onClose} className="focus-ring text-xs text-[var(--muted)] hover:text-[var(--text)]">×</button></div><div className="mt-5 border-t border-[var(--line)] pt-4"><div className="mono mb-2 text-[9px] text-[var(--muted)]">WHY IT MATTERS</div><p className="text-sm leading-6 text-[var(--muted)]">{finding.explanation}</p></div>{finding.canApplyFix && <button type="button" onClick={() => onFix(finding)} className="focus-ring mt-5 border border-[var(--accent)] px-4 py-3 text-sm text-[var(--accent)] transition hover:bg-[var(--accent)] hover:text-[#0a0c0d]">Fix this →</button>}</aside>;
}
