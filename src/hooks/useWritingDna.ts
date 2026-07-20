import { useCallback, useEffect, useState } from "react";
import type { AuthUser } from "./useAuth";
import {
  WRITING_DNA_UPDATED_EVENT,
  createWritingDnaGoal,
  deleteWritingDnaGoal,
  fetchWritingDnaDashboard,
} from "../lib/writingDnaClient";
import type { WritingDnaDashboard } from "../types/writingDna";

interface UseWritingDnaOptions {
  user: AuthUser | null;
  refreshKey?: number;
  enabled?: boolean;
}

export function useWritingDna({ user, refreshKey = 0, enabled = true }: UseWritingDnaOptions) {
  const [data, setData] = useState<WritingDnaDashboard | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sessionPage, setSessionPage] = useState(0);

  const load = useCallback(async () => {
    if (!enabled || !user) {
      setData(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const dashboard = await fetchWritingDnaDashboard(user, { sessionPage });
      setData(dashboard);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load Writing DNA.");
    } finally {
      setLoading(false);
    }
  }, [enabled, user, sessionPage]);

  useEffect(() => {
    void load();
  }, [load, refreshKey]);

  useEffect(() => {
    const handleUpdate = () => {
      void load();
    };

    window.addEventListener(WRITING_DNA_UPDATED_EVENT, handleUpdate);
    return () => window.removeEventListener(WRITING_DNA_UPDATED_EVENT, handleUpdate);
  }, [load]);

  const addGoal = useCallback(
    async (goal: { goalType: string; title: string; targetValue: number; unit?: string }) => {
      const created = await createWritingDnaGoal(user, goal);
      if (created) await load();
      return created;
    },
    [load, user],
  );

  const removeGoal = useCallback(
    async (goalId: string) => {
      await deleteWritingDnaGoal(user, goalId);
      await load();
    },
    [load, user],
  );

  return {
    data,
    loading,
    error,
    sessionPage,
    setSessionPage,
    reload: load,
    addGoal,
    removeGoal,
  };
}
