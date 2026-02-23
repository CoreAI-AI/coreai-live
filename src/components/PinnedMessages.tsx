import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Pin, X, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface PinnedMessage {
  id: string;
  content: string;
  timestamp: string;
}

interface PinnedMessagesProps {
  chatId: string | undefined;
  onUnpin: (messageId: string) => void;
  onScrollTo: (messageId: string) => void;
}

export const PinnedMessages = ({ chatId, onUnpin, onScrollTo }: PinnedMessagesProps) => {
  const [pinnedMessages, setPinnedMessages] = useState<PinnedMessage[]>([]);
  const [isExpanded, setIsExpanded] = useState(false);

  // Load pinned messages from localStorage
  useEffect(() => {
    if (!chatId) {
      setPinnedMessages([]);
      return;
    }
    
    const saved = localStorage.getItem(`pinned_messages_${chatId}`);
    if (saved) {
      try {
        setPinnedMessages(JSON.parse(saved));
      } catch {
        setPinnedMessages([]);
      }
    } else {
      setPinnedMessages([]);
    }
  }, [chatId]);

  const handleUnpin = (messageId: string) => {
    if (!chatId) return;
    
    const updated = pinnedMessages.filter(m => m.id !== messageId);
    setPinnedMessages(updated);
    localStorage.setItem(`pinned_messages_${chatId}`, JSON.stringify(updated));
    onUnpin(messageId);
  };

  if (pinnedMessages.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-primary/5 border-b border-primary/20 px-4 py-2"
    >
      <div 
        className="flex items-center justify-between cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-2">
          <Pin className="w-4 h-4 text-primary" />
          <span className="text-sm font-medium text-primary">
            {pinnedMessages.length} Pinned Message{pinnedMessages.length > 1 ? 's' : ''}
          </span>
        </div>
        <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </Button>
      </div>
      
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="mt-2 space-y-2 max-h-32 overflow-y-auto">
              {pinnedMessages.map((msg) => (
                <div 
                  key={msg.id}
                  className="flex items-start gap-2 p-2 bg-background rounded-lg group cursor-pointer hover:bg-muted/50"
                  onClick={() => onScrollTo(msg.id)}
                >
                  <p className="text-sm text-muted-foreground flex-1 line-clamp-2">
                    {msg.content}
                  </p>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-5 w-5 p-0 opacity-0 group-hover:opacity-100 shrink-0"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleUnpin(msg.id);
                    }}
                  >
                    <X className="w-3 h-3" />
                  </Button>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

// Helper function to pin a message
export const pinMessage = (chatId: string, messageId: string, content: string) => {
  const saved = localStorage.getItem(`pinned_messages_${chatId}`);
  let pinnedMessages: PinnedMessage[] = [];
  
  if (saved) {
    try {
      pinnedMessages = JSON.parse(saved);
    } catch {
      pinnedMessages = [];
    }
  }
  
  // Check if already pinned
  if (pinnedMessages.some(m => m.id === messageId)) {
    return false;
  }
  
  pinnedMessages.push({
    id: messageId,
    content: content.substring(0, 200),
    timestamp: new Date().toISOString(),
  });
  
  localStorage.setItem(`pinned_messages_${chatId}`, JSON.stringify(pinnedMessages));
  return true;
};
