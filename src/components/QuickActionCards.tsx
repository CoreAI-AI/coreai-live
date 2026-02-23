import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingCart, Search, TrendingUp, Newspaper, Image, MessageCircle, FileText, MoreHorizontal, Calendar, PenLine, Code, Sparkles, Brain, ImageIcon, X, Send } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface QuickActionCardsProps {
  onAction: (prompt: string) => void;
  onSkip?: () => void;
}

const actions = [{
  id: "shopping",
  icon: ShoppingCart,
  title: "Shopping",
  description: "Best deals & products",
  prompt: "Help me with shopping research. I want to find the best products and deals for my needs.",
  gradient: "from-orange-500 to-pink-500"
}, {
  id: "deep-search",
  icon: Search,
  title: "Deep Search",
  description: "In-depth research",
  prompt: "Perform a deep search and provide comprehensive information on a topic I'm interested in.",
  gradient: "from-blue-500 to-cyan-500"
}, {
  id: "financial",
  icon: TrendingUp,
  title: "Financial",
  description: "Market insights",
  prompt: "Help me with financial research. Provide market analysis and investment insights.",
  gradient: "from-green-500 to-emerald-500"
}, {
  id: "news",
  icon: Newspaper,
  title: "Today News",
  description: "Latest updates",
  prompt: "Give me today's top news and important updates from around the world.",
  gradient: "from-purple-500 to-violet-500"
}];

// Main quick actions
const mainActions = [
  {
    id: "create-image",
    icon: Image,
    title: "Create image",
    placeholder: "Describe what image you want...",
    options: [
      "Generate a logo for my brand",
      "Create an illustration for my blog",
      "Design a social media post",
      "Make an artistic portrait"
    ]
  },
  {
    id: "get-advice",
    icon: MessageCircle,
    title: "Get advice",
    placeholder: "What do you need advice on...",
    options: [
      "Career guidance",
      "Relationship advice",
      "Health & wellness tips",
      "Financial planning"
    ]
  },
  {
    id: "summarize",
    icon: FileText,
    title: "Summarize text",
    placeholder: "Paste or describe the text to summarize...",
    options: [
      "Summarize an article",
      "Create meeting notes",
      "Condense a research paper",
      "Simplify complex content"
    ]
  }
];

// More menu actions
const moreActions = [
  {
    id: "make-plan",
    icon: Calendar,
    title: "Make a plan",
    placeholder: "What do you want to plan...",
    options: [
      "Plan a vacation trip",
      "Create a workout schedule",
      "Organize a project timeline",
      "Plan a weekly meal prep"
    ]
  },
  {
    id: "help-write",
    icon: PenLine,
    title: "Help me write",
    placeholder: "What do you want to write...",
    options: [
      "Write an email",
      "Draft a cover letter",
      "Create social media content",
      "Write a blog post"
    ]
  },
  {
    id: "code",
    icon: Code,
    title: "Code",
    placeholder: "Describe your coding task...",
    options: [
      "Debug my code",
      "Explain a concept",
      "Write a function",
      "Review my code"
    ]
  },
  {
    id: "surprise-me",
    icon: Sparkles,
    title: "Surprise me",
    placeholder: "What kind of surprise...",
    options: [
      "Tell me a fun fact",
      "Share an interesting story",
      "Give me a random challenge",
      "Suggest something new to try"
    ]
  },
  {
    id: "brainstorm",
    icon: Brain,
    title: "Brainstorm",
    placeholder: "What topic to brainstorm...",
    options: [
      "Business ideas",
      "Creative project concepts",
      "Problem-solving strategies",
      "Content ideas"
    ]
  },
  {
    id: "analyze-image",
    icon: ImageIcon,
    title: "Analyze image",
    placeholder: "Describe what to analyze...",
    options: [
      "Describe what's in this image",
      "Extract text from image",
      "Identify objects or people",
      "Analyze image composition"
    ]
  }
];

export const QuickActionCards = ({
  onAction,
  onSkip
}: QuickActionCardsProps) => {
  const [selectedAction, setSelectedAction] = useState<{
    title: string;
    options: string[];
    placeholder?: string;
  } | null>(null);
  const [customInput, setCustomInput] = useState("");

  const handleActionClick = (action: { title: string; options: string[] }) => {
    setSelectedAction(action);
    setCustomInput("");
  };

  const handleOptionClick = (option: string) => {
    onAction(option);
    setSelectedAction(null);
    setCustomInput("");
  };

  const handleCustomSubmit = () => {
    if (customInput.trim()) {
      onAction(`${selectedAction?.title}: ${customInput.trim()}`);
      setSelectedAction(null);
      setCustomInput("");
    }
  };

  return (
    <div className="w-full max-w-md mx-auto px-2">
      {/* Welcome Header - Centered like ChatGPT */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-6"
      >
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-semibold text-foreground">
          How can I help you?
        </h1>
      </motion.div>

      {/* Options Modal */}
      <AnimatePresence>
        {selectedAction && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="mb-4 p-4 bg-card border border-border rounded-xl"
          >
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-medium text-foreground">{selectedAction.title}</h3>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={() => setSelectedAction(null)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="grid grid-cols-1 gap-2">
              {selectedAction.options.map((option, idx) => (
                <Button
                  key={idx}
                  variant="outline"
                  className="justify-start text-left h-auto py-2 px-3 text-sm"
                  onClick={() => handleOptionClick(option)}
                >
                  {option}
                </Button>
              ))}
            </div>
            
            {/* Custom Input */}
            <div className="mt-3 pt-3 border-t border-border">
              <p className="text-xs text-muted-foreground mb-2">Or type your own:</p>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <AnimatePresence mode="wait">
                    <motion.span
                      key={selectedAction.placeholder}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.2 }}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm pointer-events-none"
                      style={{ display: customInput ? 'none' : 'block' }}
                    >
                      {selectedAction.placeholder || "Type your request..."}
                    </motion.span>
                  </AnimatePresence>
                  <Input
                    value={customInput}
                    onChange={(e) => setCustomInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleCustomSubmit()}
                    className="flex-1 h-9 text-sm w-full"
                  />
                </div>
                <Button
                  size="icon"
                  className="h-9 w-9 shrink-0"
                  onClick={handleCustomSubmit}
                  disabled={!customInput.trim()}
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Quick Action Buttons */}
      {!selectedAction && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="space-y-3 mb-4"
        >
          {/* First Row: Create image, Get advice */}
          <div className="flex gap-2 justify-center">
            {mainActions.slice(0, 2).map((action) => (
              <Button
                key={action.id}
                variant="outline"
                className="flex items-center gap-2 px-4 py-2 rounded-full"
                onClick={() => handleActionClick(action)}
              >
                <action.icon className="h-4 w-4" />
                <span className="text-sm">{action.title}</span>
              </Button>
            ))}
          </div>

          {/* Second Row: Summarize text, More */}
          <div className="flex gap-2 justify-center">
            <Button
              variant="outline"
              className="flex items-center gap-2 px-4 py-2 rounded-full"
              onClick={() => handleActionClick(mainActions[2])}
            >
              <FileText className="h-4 w-4" />
              <span className="text-sm">Summarize text</span>
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  className="flex items-center gap-2 px-4 py-2 rounded-full"
                >
                  <MoreHorizontal className="h-4 w-4" />
                  <span className="text-sm">More</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="center" className="w-48 bg-popover border border-border z-50">
                {moreActions.map((action) => (
                  <DropdownMenuItem
                    key={action.id}
                    className="flex items-center gap-2 cursor-pointer"
                    onClick={() => handleActionClick(action)}
                  >
                    <action.icon className="h-4 w-4" />
                    <span>{action.title}</span>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </motion.div>
      )}

      {/* Action Cards Grid - Desktop Only */}
      <div className="hidden sm:grid grid-cols-2 gap-2">
        {actions.map((action, index) => (
          <motion.div
            key={action.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              delay: 0.1 + index * 0.03,
              duration: 0.25,
              ease: "easeOut"
            }}
          >
            <Card
              className="relative overflow-hidden p-2 bg-card hover:bg-accent/50 border border-border hover:border-primary/30 transition-all duration-200 group cursor-pointer active:scale-[0.98]"
              onClick={() => onAction(action.prompt)}
            >
              <div className="flex items-center gap-2">
                <div className={`w-7 h-7 rounded-md bg-gradient-to-br ${action.gradient} flex items-center justify-center shrink-0`}>
                  <action.icon className="w-3.5 h-3.5 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-foreground text-xs group-hover:text-primary transition-colors truncate">
                    {action.title}
                  </h3>
                  <p className="text-[10px] text-muted-foreground truncate">
                    {action.description}
                  </p>
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
};
