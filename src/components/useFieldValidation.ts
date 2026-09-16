"use client";

import { useCallback, useState, type FocusEvent } from "react";
import type { FormProblem } from "@/lib/form-errors";

// Validate on leaving a field, then revalidate that field as it is corrected.
// A submit attempt reveals the complete set; typing never moves focus.
export function useFieldValidation(all: FormProblem[], attempted: boolean, submitProblems = all) {
  const [touched, setTouched] = useState<Set<string>>(() => new Set());
  const resetFields = useCallback(() => setTouched(new Set()), []);
  function onBlurCapture(event: FocusEvent<HTMLElement>) {
    const path = (event.target as HTMLElement).dataset.validationField;
    if (path) setTouched((previous) => previous.has(path) ? previous : new Set(previous).add(path));
  }
  return {
    problems: all.filter((problem) => (attempted && submitProblems.includes(problem)) || [...touched].some((path) => problem.path === path || problem.path.startsWith(`${path}.`))),
    onBlurCapture,
    resetFields,
  };
}
