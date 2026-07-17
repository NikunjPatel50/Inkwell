import { useMemo } from "react";
import { computeDashboardStats } from "../lib/pteDashboardStats";
import type { PTEEssaySession } from "../types/writingMode";

export function useDashboardStats(sessions: PTEEssaySession[]) {
  return useMemo(() => computeDashboardStats(sessions), [sessions]);
}
