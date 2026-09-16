"use client";

import { useCallback, useState } from "react";
export type FeedbackTone = "info" | "success" | "error" | "warning";
export function useAdminFeedback(initial = "") {
  const [feedback, setFeedback] = useState({ message: initial, tone: "info" as FeedbackTone });
  const setMessage = useCallback((message: string, tone: FeedbackTone = "info") => setFeedback({ message, tone }), []);
  return { ...feedback, setMessage };
}
