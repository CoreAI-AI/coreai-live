import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Brain, Lock, Unlock, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

interface MemoryControlProps {
  chatId: string | undefined;
  onMemoryChange?: (enabled: boolean) => void;
}

export const MemoryControl = ({ chatId, onMemoryChange }: MemoryControlProps) => {
  const [memoryEnabled, setMemoryEnabled] = useState(true);
  const [isOpen, setIsOpen] = useState(false);

  // Load memory setting for this chat
  useEffect(() => {
    if (!chatId) {
      setMemoryEnabled(true);
      return;
    }
    
    const saved = localStorage.getItem(`chat_memory_${chatId}`);
    if (saved !== null) {
      setMemoryEnabled(saved === 'true');
    } else {
      setMemoryEnabled(true);
    }
  }, [chatId]);

  const handleToggle = (enabled: boolean) => {
    setMemoryEnabled(enabled);
    if (chatId) {
      localStorage.setItem(`chat_memory_${chatId}`, String(enabled));
    }
    onMemoryChange?.(enabled);
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className={cn(
            "h-8 gap-1.5 px-2 text-xs",
            memoryEnabled ? "text-primary" : "text-muted-foreground"
          )}
        >
          {memoryEnabled ? (
            <Brain className="w-3.5 h-3.5" />
          ) : (
            <Lock className="w-3.5 h-3.5" />
          )}
          <span className="hidden sm:inline">
            {memoryEnabled ? "Memory On" : "Memory Off"}
          </span>
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-72">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Brain className="w-4 h-4 text-primary" />
              <span className="font-medium text-sm">Context Memory</span>
            </div>
            <Switch
              checked={memoryEnabled}
              onCheckedChange={handleToggle}
            />
          </div>
          
          <p className="text-xs text-muted-foreground">
            {memoryEnabled ? (
              <>
                <Unlock className="w-3 h-3 inline mr-1" />
                AI will remember this conversation context and provide personalized responses.
              </>
            ) : (
              <>
                <Lock className="w-3 h-3 inline mr-1" />
                Private mode: AI won't store or use context from this chat.
              </>
            )}
          </p>

          <div className="flex items-start gap-2 p-2 bg-muted rounded-lg">
            <Info className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
            <p className="text-xs text-muted-foreground">
              Turn off memory for sensitive conversations. Your messages are never shared.
            </p>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};
