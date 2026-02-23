import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  MessageSquare,
  MessageSquarePlus, 
  Mic, 
  Camera, 
  Image as ImageIcon,
  X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface FloatingActionButtonProps {
  onNewChat: () => void;
  onVoiceInput: () => void;
  onCameraUpload: () => void;
  onImageUpload: () => void;
  isTyping?: boolean;
  isLoading?: boolean;
  className?: string;
}

const fabActions = [
  { id: 'new-chat', icon: MessageSquarePlus, label: 'New Chat', color: 'bg-primary' },
  { id: 'voice', icon: Mic, label: 'Voice', color: 'bg-emerald-500' },
  { id: 'camera', icon: Camera, label: 'Camera', color: 'bg-violet-500' },
  { id: 'image', icon: ImageIcon, label: 'Image', color: 'bg-amber-500' },
];

export const FloatingActionButton = ({
  onNewChat,
  onVoiceInput,
  onCameraUpload,
  onImageUpload,
  isTyping = false,
  isLoading = false,
  className,
}: FloatingActionButtonProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleAction = (actionId: string) => {
    setIsOpen(false);
    switch (actionId) {
      case 'new-chat':
        onNewChat();
        break;
      case 'voice':
        onVoiceInput();
        break;
      case 'camera':
        onCameraUpload();
        break;
      case 'image':
        onImageUpload();
        break;
    }
  };

  // Hide FAB when typing or AI is responding
  const shouldHide = isTyping || isLoading;

  return (
    <AnimatePresence>
      {!shouldHide && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className={cn("fixed bottom-24 right-4 z-50 md:hidden", className)}
        >
          {/* Action buttons */}
          <AnimatePresence>
            {isOpen && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute bottom-12 right-0 flex flex-col-reverse gap-2 items-end"
              >
                {fabActions.map((action, index) => (
                  <motion.div
                    key={action.id}
                    initial={{ opacity: 0, x: 20, scale: 0.8 }}
                    animate={{ opacity: 1, x: 0, scale: 1 }}
                    exit={{ opacity: 0, x: 20, scale: 0.8 }}
                    transition={{ delay: index * 0.04, duration: 0.15 }}
                    className="flex items-center gap-2"
                  >
                    <span className="text-xs font-medium bg-background/95 backdrop-blur-sm px-2.5 py-1 rounded-full shadow-lg border border-border">
                      {action.label}
                    </span>
                    <Button
                      className={cn(
                        "h-10 w-10 rounded-full shadow-lg",
                        action.color,
                        "text-white hover:opacity-90"
                      )}
                      onClick={() => handleAction(action.id)}
                    >
                      <action.icon className="w-4 h-4" />
                    </Button>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Main FAB */}
          <Button
            className={cn(
              "h-9 w-9 rounded-full shadow-xl bg-foreground dark:bg-white",
              "hover:opacity-90 transition-all duration-200"
            )}
            onClick={() => setIsOpen(!isOpen)}
          >
            <AnimatePresence mode="wait">
              {isOpen ? (
                <motion.div
                  key="close"
                  initial={{ rotate: -90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: 90, opacity: 0 }}
                  transition={{ duration: 0.15 }}
                >
                  <X className="w-3.5 h-3.5 text-background dark:text-black" />
                </motion.div>
              ) : (
                <motion.div
                  key="chat"
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.8, opacity: 0 }}
                  transition={{ duration: 0.15 }}
                >
                  <MessageSquare className="w-3.5 h-3.5 text-background dark:text-black" />
                </motion.div>
              )}
            </AnimatePresence>
          </Button>

          {/* Backdrop */}
          <AnimatePresence>
            {isOpen && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/20 backdrop-blur-sm -z-10"
                onClick={() => setIsOpen(false)}
              />
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
