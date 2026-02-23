import { useEffect } from 'react';

interface ShortcutHandlers {
  onNewChat?: () => void;
  onSearchChats?: () => void;
  onToggleModels?: () => void;
  onStartVoice?: () => void;
  onOpenDocuments?: () => void;
  onOpenNotes?: () => void;
  onShowHelp?: () => void;
}

export const useKeyboardShortcuts = (handlers: ShortcutHandlers) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isCtrl = e.ctrlKey || e.metaKey;

      if (isCtrl && e.key === 'k') {
        e.preventDefault();
        handlers.onNewChat?.();
      } else if (isCtrl && e.key === '/') {
        e.preventDefault();
        handlers.onSearchChats?.();
      } else if (isCtrl && e.shiftKey && e.key === 'M') {
        e.preventDefault();
        handlers.onToggleModels?.();
      } else if (isCtrl && e.shiftKey && e.key === 'V') {
        e.preventDefault();
        handlers.onStartVoice?.();
      } else if (isCtrl && e.shiftKey && e.key === 'D') {
        e.preventDefault();
        handlers.onOpenDocuments?.();
      } else if (isCtrl && e.shiftKey && e.key === 'N') {
        e.preventDefault();
        handlers.onOpenNotes?.();
      } else if (isCtrl && e.key === '?') {
        e.preventDefault();
        handlers.onShowHelp?.();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handlers]);
};