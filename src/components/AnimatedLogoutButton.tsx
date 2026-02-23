import { useState } from "react";
import { LogOut, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

interface AnimatedLogoutButtonProps {
  onSignOut: () => Promise<void> | void;
  isDemo?: boolean;
}

export const AnimatedLogoutButton = ({ onSignOut, isDemo }: AnimatedLogoutButtonProps) => {
  const [state, setState] = useState<"idle" | "loading" | "success">("idle");

  const handleClick = async () => {
    if (state !== "idle") return;
    
    setState("loading");

    // Simulate a slight delay for the animation
    await new Promise((resolve) => setTimeout(resolve, 1200));

    try {
      await onSignOut();
      setState("success");
      
      // Reset after success animation
      setTimeout(() => {
        setState("idle");
      }, 1000);
    } catch (error) {
      setState("idle");
    }
  };

  return (
    <button
      onClick={handleClick}
      disabled={state !== "idle"}
      className={cn(
        "relative w-full h-10 rounded-xl font-medium text-sm overflow-hidden transition-all duration-300",
        "flex items-center justify-center gap-2",
        state === "idle" && "bg-transparent hover:bg-destructive/10 text-sidebar-foreground hover:text-destructive border border-transparent",
        state === "loading" && "bg-orange-500 text-white cursor-not-allowed",
        state === "success" && "bg-green-500 text-white cursor-default"
      )}
    >
      <AnimatePresence mode="wait">
        {state === "idle" && (
          <motion.span
            key="idle"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="flex items-center gap-2"
          >
            <LogOut className="w-4 h-4" />
            {isDemo ? "Exit Demo" : "Sign Out"}
          </motion.span>
        )}

        {state === "loading" && (
          <motion.span
            key="loading"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="flex items-center gap-2"
          >
            <motion.span
              animate={{ opacity: [0.4, 1, 0.4] }}
              transition={{ duration: 1, repeat: Infinity }}
            >
              Logging out...
            </motion.span>
          </motion.span>
        )}

        {state === "success" && (
          <motion.span
            key="success"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.2 }}
            className="flex items-center gap-2"
          >
            <Check className="w-4 h-4" />
            Logged Out
          </motion.span>
        )}
      </AnimatePresence>
    </button>
  );
};
