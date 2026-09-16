"use client";
import type { FormProblem } from "@/lib/form-errors";

export function fieldProblemProps(problems: FormProblem[], path: string) {
  const invalid = problems.some((problem) => problem.path === path || problem.path.startsWith(`${path}.`));
  return { "data-validation-field": path, "aria-invalid": invalid || undefined, "aria-describedby": invalid ? `problem-${path}` : undefined };
}
export function FieldProblem({ problems, path }: { problems: FormProblem[]; path: string }) {
  const problem = problems.find((item) => item.path === path || item.path.startsWith(`${path}.`));
  return <span id={`problem-${path}`} aria-live="polite" aria-atomic="true" className={problem ? "mt-1 block text-sm text-vital" : "sr-only"}>{problem?.message ?? ""}</span>;
}
export function focusProblem(path: string) {
  let target = path;
  let field: HTMLElement | null = null;
  while (target && !field) { field = document.querySelector<HTMLElement>(`[data-validation-field="${CSS.escape(target)}"]`); target = target.split(".").slice(0, -1).join("."); }
  field ??= document.querySelector<HTMLElement>('[aria-label="Fields to check"]');
  let parent = field?.parentElement;
  while (parent) { if (parent instanceof HTMLDetailsElement) parent.open = true; parent = parent.parentElement; }
  field?.focus(); field?.scrollIntoView({ block: "center" });
}
export function FormProblems({ problems, onSelect }: { problems: FormProblem[]; onSelect: (problem: FormProblem) => void }) {
  if (!problems.length) return null;
  return <section tabIndex={-1} aria-label="Fields to check" className="my-5 rounded-xl border border-vital/40 bg-white p-4 sm:p-5">
    <h2 className="font-semibold text-navy">Please check {problems.length === 1 ? "this field" : "these fields"}</h2><p className="mt-1 text-sm text-ink-soft">Your edits are still here. Select an issue to review it, then try again.</p>
    <ul className="mt-3 max-h-64 space-y-1 overflow-y-auto">{problems.map((problem, index) => <li key={`${problem.path}-${index}`}><button type="button" onClick={() => onSelect(problem)} className="min-h-11 w-full break-words rounded px-2 py-2 text-left text-sm text-navy underline decoration-hair underline-offset-4 hover:bg-navy-tint"><span className="font-medium">{problem.label}:</span> {problem.message}</button></li>)}</ul>
  </section>;
}
