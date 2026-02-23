import { motion } from "framer-motion";
import { Sparkles, FileText, Globe, Lightbulb, RefreshCw, Wand2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface QuickActionButtonsProps {
  onRewrite: () => void;
  onSummarize: () => void;
  onTranslate: () => void;
  onImprove: () => void;
  onRegenerate: () => void;
  disabled?: boolean;
  hasMessage?: boolean;
}

const actions = [
  { id: 'rewrite', icon: Wand2, label: 'Rewrite', color: 'text-blue-500' },
  { id: 'summarize', icon: FileText, label: 'Summarize', color: 'text-green-500' },
  { id: 'translate', icon: Globe, label: 'Translate', color: 'text-purple-500' },
  { id: 'improve', icon: Lightbulb, label: 'Improve', color: 'text-yellow-500' },
  { id: 'regenerate', icon: RefreshCw, label: 'Regenerate', color: 'text-orange-500' },
];

export const QuickActionButtons = ({
  onRewrite,
  onSummarize,
  onTranslate,
  onImprove,
  onRegenerate,
  disabled = false,
  hasMessage = false,
}: QuickActionButtonsProps) => {
  if (!hasMessage) return null;

  const handleAction = (actionId: string) => {
    switch (actionId) {
      case 'rewrite':
        onRewrite();
        break;
      case 'summarize':
        onSummarize();
        break;
      case 'translate':
        onTranslate();
        break;
      case 'improve':
        onImprove();
        break;
      case 'regenerate':
        onRegenerate();
        break;
    }
  };

  return (
    <TooltipProvider>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-1.5 p-1.5 bg-muted/50 rounded-xl border border-border"
      >
        {actions.map((action, index) => (
          <Tooltip key={action.id}>
            <TooltipTrigger asChild>
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05 }}
              >
                <Button
                  variant="ghost"
                  size="sm"
                  className={`h-8 w-8 p-0 ${action.color} hover:bg-muted`}
                  onClick={() => handleAction(action.id)}
                  disabled={disabled}
                >
                  <action.icon className="w-4 h-4" />
                </Button>
              </motion.div>
            </TooltipTrigger>
            <TooltipContent>
              <p>{action.label}</p>
            </TooltipContent>
          </Tooltip>
        ))}
      </motion.div>
    </TooltipProvider>
  );
};
