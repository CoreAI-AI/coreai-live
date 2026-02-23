import { useState, useEffect, useCallback } from 'react';
import { useOnlineStatus } from './useOnlineStatus';
import { toast } from 'sonner';

interface DraftMessage {
  id: string;
  content: string;
  chatId?: string;
  createdAt: string;
  images?: any[];
}

const DRAFTS_KEY = 'offline_drafts';

export const useOfflineDraft = () => {
  const [drafts, setDrafts] = useState<DraftMessage[]>([]);
  const isOnline = useOnlineStatus();

  // Load drafts from localStorage
  useEffect(() => {
    const saved = localStorage.getItem(DRAFTS_KEY);
    if (saved) {
      try {
        setDrafts(JSON.parse(saved));
      } catch {
        setDrafts([]);
      }
    }
  }, []);

  // Save draft when offline
  const saveDraft = useCallback((content: string, chatId?: string, images?: any[]) => {
    const newDraft: DraftMessage = {
      id: crypto.randomUUID(),
      content,
      chatId,
      createdAt: new Date().toISOString(),
      images,
    };

    setDrafts(prev => {
      const updated = [...prev, newDraft];
      localStorage.setItem(DRAFTS_KEY, JSON.stringify(updated));
      return updated;
    });

    if (!isOnline) {
      toast.info("Message saved as draft (offline)");
    }

    return newDraft.id;
  }, [isOnline]);

  // Remove draft after sending
  const removeDraft = useCallback((draftId: string) => {
    setDrafts(prev => {
      const updated = prev.filter(d => d.id !== draftId);
      localStorage.setItem(DRAFTS_KEY, JSON.stringify(updated));
      return updated;
    });
  }, []);

  // Clear all drafts
  const clearDrafts = useCallback(() => {
    setDrafts([]);
    localStorage.removeItem(DRAFTS_KEY);
  }, []);

  // Get pending drafts count
  const pendingCount = drafts.length;

  // Auto-send drafts when back online
  const getPendingDrafts = useCallback(() => {
    return drafts;
  }, [drafts]);

  return {
    drafts,
    saveDraft,
    removeDraft,
    clearDrafts,
    pendingCount,
    getPendingDrafts,
    isOnline,
  };
};
