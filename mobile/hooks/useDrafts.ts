import { useEffect, useCallback } from "react";
import {
  savePlaceDraft,
  getPlaceDraft,
  getAllPlaceDrafts,
  deletePlaceDraft,
  createAutoSaveDraft,
  type PlaceDraft,
} from "../services/drafts";

/**
 * Hook for managing place drafts with auto-save
 */
export function usePlaceDrafts() {
  const saveCurrentDraft = useCallback(
    async (
      draft: Omit<PlaceDraft, "id" | "createdAt" | "updatedAt"> & {
        id?: string;
        createdAt?: number;
        updatedAt?: number;
      },
    ) => {
      try {
        return await savePlaceDraft(draft);
      } catch (error) {
        console.error("[usePlaceDrafts] Save failed:", error);
        throw error;
      }
    },
    [],
  );

  const loadDraft = useCallback(async (draftId: string) => {
    try {
      return await getPlaceDraft(draftId);
    } catch (error) {
      console.error("[usePlaceDrafts] Load failed:", error);
      return null;
    }
  }, []);

  const loadAllDrafts = useCallback(async () => {
    try {
      return await getAllPlaceDrafts();
    } catch (error) {
      console.error("[usePlaceDrafts] Load all failed:", error);
      return [];
    }
  }, []);

  const removeDraft = useCallback(async (draftId: string) => {
    try {
      await deletePlaceDraft(draftId);
    } catch (error) {
      console.error("[usePlaceDrafts] Delete failed:", error);
      throw error;
    }
  }, []);

  const setupAutoSave = useCallback(
    (
      draftId: string,
      draft: Omit<PlaceDraft, "id" | "createdAt" | "updatedAt">,
      intervalMs?: number,
    ) => {
      return createAutoSaveDraft(draftId, draft, intervalMs);
    },
    [],
  );

  return {
    saveDraft: saveCurrentDraft,
    loadDraft,
    loadAllDrafts,
    removeDraft,
    setupAutoSave,
  };
}

// Alias for compatibility
export const useDrafts = usePlaceDrafts;
