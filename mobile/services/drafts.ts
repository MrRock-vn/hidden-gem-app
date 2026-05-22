import { appStorage } from "./storage";

export interface PlaceDraft {
  id: string;
  title: string;
  description: string;
  category: string;
  address: string;
  latitude?: number;
  longitude?: number;
  tags: string;
  imageUris: string[];
  createdAt: number;
  updatedAt: number;
}

const DRAFT_PREFIX = "place_draft_";
const DRAFTS_LIST_KEY = "place_drafts_list";

/**
 * Save a place draft
 */
export async function savePlaceDraft(
  draft: Omit<PlaceDraft, "id" | "createdAt" | "updatedAt"> & {
    id?: string;
    createdAt?: number;
    updatedAt?: number;
  },
): Promise<PlaceDraft> {
  try {
    const id = draft.id || `draft_${Date.now()}`;
    const now = Date.now();

    const completeDraft: PlaceDraft = {
      id,
      ...draft,
      createdAt: draft.createdAt || now,
      updatedAt: now,
    };

    // Save draft data
    await appStorage.setItem(
      `${DRAFT_PREFIX}${id}`,
      JSON.stringify(completeDraft),
    );

    // Update drafts list
    const draftsList = await getAllDraftIds();
    if (!draftsList.includes(id)) {
      draftsList.push(id);
      await appStorage.setItem(DRAFTS_LIST_KEY, JSON.stringify(draftsList));
    }

    console.log("[Drafts] Saved draft:", id);
    return completeDraft;
  } catch (error) {
    console.error("[Drafts] Failed to save draft:", error);
    throw error;
  }
}

/**
 * Get a specific draft by ID
 */
export async function getPlaceDraft(
  draftId: string,
): Promise<PlaceDraft | null> {
  try {
    const data = await appStorage.getItem(`${DRAFT_PREFIX}${draftId}`);
    if (!data) return null;
    return JSON.parse(data) as PlaceDraft;
  } catch (error) {
    console.error("[Drafts] Failed to get draft:", error);
    return null;
  }
}

/**
 * Get all place drafts
 */
export async function getAllPlaceDrafts(): Promise<PlaceDraft[]> {
  try {
    const draftIds = await getAllDraftIds();
    const drafts: PlaceDraft[] = [];

    for (const id of draftIds) {
      const draft = await getPlaceDraft(id);
      if (draft) {
        drafts.push(draft);
      }
    }

    // Sort by updated date (newest first)
    return drafts.sort((a, b) => b.updatedAt - a.updatedAt);
  } catch (error) {
    console.error("[Drafts] Failed to get all drafts:", error);
    return [];
  }
}

/**
 * Delete a draft
 */
export async function deletePlaceDraft(draftId: string): Promise<void> {
  try {
    await appStorage.removeItem(`${DRAFT_PREFIX}${draftId}`);

    // Update drafts list
    const draftsList = await getAllDraftIds();
    const filtered = draftsList.filter((id) => id !== draftId);
    await appStorage.setItem(DRAFTS_LIST_KEY, JSON.stringify(filtered));

    console.log("[Drafts] Deleted draft:", draftId);
  } catch (error) {
    console.error("[Drafts] Failed to delete draft:", error);
  }
}

/**
 * Get count of saved drafts
 */
export async function getPlaceDraftsCount(): Promise<number> {
  try {
    const draftIds = await getAllDraftIds();
    return draftIds.length;
  } catch (error) {
    console.error("[Drafts] Failed to get drafts count:", error);
    return 0;
  }
}

/**
 * Clear all drafts (use with caution)
 */
export async function clearAllPlaceDrafts(): Promise<void> {
  try {
    const draftIds = await getAllDraftIds();

    // Delete each draft
    for (const id of draftIds) {
      await appStorage.removeItem(`${DRAFT_PREFIX}${id}`);
    }

    // Clear list
    await appStorage.removeItem(DRAFTS_LIST_KEY);

    console.log("[Drafts] Cleared all drafts");
  } catch (error) {
    console.error("[Drafts] Failed to clear drafts:", error);
  }
}

/**
 * Get list of draft IDs
 */
async function getAllDraftIds(): Promise<string[]> {
  try {
    const data = await appStorage.getItem(DRAFTS_LIST_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.warn("[Drafts] Failed to get drafts list:", error);
    return [];
  }
}

/**
 * Auto-save draft periodically (call in useEffect)
 */
export function createAutoSaveDraft(
  draftId: string,
  draft: Omit<PlaceDraft, "id" | "createdAt" | "updatedAt">,
  intervalMs: number = 30000, // Auto-save every 30 seconds
): () => void {
  let timeout: ReturnType<typeof setTimeout>;

  const autoSave = async () => {
    try {
      await savePlaceDraft({ ...draft, id: draftId });
    } catch (error) {
      console.error("[Drafts] Auto-save failed:", error);
    }
    timeout = setTimeout(autoSave, intervalMs);
  };

  timeout = setTimeout(autoSave, intervalMs);

  // Return cleanup function
  return () => {
    if (timeout) clearTimeout(timeout);
  };
}
