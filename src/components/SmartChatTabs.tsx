import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Plus, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Chat } from "@/hooks/useChats";

interface SmartChatTabsProps {
  openChats: Chat[];
  activeChat: Chat | null;
  onSelectTab: (chat: Chat) => void;
  onCloseTab: (chatId: string) => void;
  onNewTab: () => void;
}

export const SmartChatTabs = ({
  openChats,
  activeChat,
  onSelectTab,
  onCloseTab,
  onNewTab,
}: SmartChatTabsProps) => {
  if (openChats.length <= 1) return null;

  return (
    <div className="flex items-center gap-1 bg-muted/50 px-2 py-1.5 border-b border-border overflow-x-auto scrollbar-hide">
      <AnimatePresence mode="popLayout">
        {openChats.map((chat) => (
          <motion.div
            key={chat.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.15 }}
            className={cn(
              "group flex items-center gap-2 px-3 py-1.5 rounded-lg cursor-pointer transition-all duration-200",
              activeChat?.id === chat.id
                ? "bg-background shadow-sm border border-border"
                : "hover:bg-background/50"
            )}
            onClick={() => onSelectTab(chat)}
          >
            <MessageSquare className="w-3.5 h-3.5 text-muted-foreground" />
            <span className="text-sm truncate max-w-[120px]">
              {chat.title}
            </span>
            <Button
              variant="ghost"
              size="sm"
              className="h-5 w-5 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={(e) => {
                e.stopPropagation();
                onCloseTab(chat.id);
              }}
            >
              <X className="w-3 h-3" />
            </Button>
          </motion.div>
        ))}
      </AnimatePresence>
      
      <Button
        variant="ghost"
        size="sm"
        className="h-7 w-7 p-0 shrink-0"
        onClick={onNewTab}
      >
        <Plus className="w-4 h-4" />
      </Button>
    </div>
  );
};
