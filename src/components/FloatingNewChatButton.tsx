import { motion } from "framer-motion";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

interface FloatingNewChatButtonProps {
  onClick: () => void;
}

export const FloatingNewChatButton = ({ onClick }: FloatingNewChatButtonProps) => {
  return (
    <motion.div
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: "spring", stiffness: 260, damping: 20 }}
      className="fixed bottom-8 right-8 z-50"
    >
      <motion.div
        animate={{ 
          boxShadow: [
            "0 0 20px hsl(207 90% 54% / 0.4)",
            "0 0 40px hsl(207 90% 54% / 0.6)",
            "0 0 20px hsl(207 90% 54% / 0.4)",
          ]
        }}
        transition={{ duration: 2, repeat: Infinity }}
        className="rounded-full"
      >
        <Button
          onClick={onClick}
          size="lg"
          className="h-16 w-16 rounded-full bg-primary hover:bg-primary/90 shadow-lg"
        >
          <Plus className="h-6 w-6" />
        </Button>
      </motion.div>
    </motion.div>
  );
};
