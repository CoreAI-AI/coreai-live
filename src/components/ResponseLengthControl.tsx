import { motion } from "framer-motion";
import { AlignLeft, AlignCenter, AlignJustify } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

type ResponseLength = 'short' | 'normal' | 'detailed';

interface ResponseLengthControlProps {
  value: ResponseLength;
  onChange: (value: ResponseLength) => void;
}

const lengthOptions: { value: ResponseLength; icon: any; label: string; description: string }[] = [
  { value: 'short', icon: AlignLeft, label: 'Short', description: 'Brief, concise answers' },
  { value: 'normal', icon: AlignCenter, label: 'Normal', description: 'Balanced responses' },
  { value: 'detailed', icon: AlignJustify, label: 'Detailed', description: 'In-depth explanations' },
];

export const ResponseLengthControl = ({ value, onChange }: ResponseLengthControlProps) => {
  const selected = lengthOptions.find(o => o.value === value) || lengthOptions[1];

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="h-8 gap-1.5 px-2 text-xs text-muted-foreground hover:text-foreground"
        >
          <selected.icon className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">{selected.label}</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-56 p-2">
        <div className="space-y-1">
          <p className="text-xs font-medium text-muted-foreground px-2 py-1">
            Response Length
          </p>
          {lengthOptions.map((option) => (
            <motion.button
              key={option.value}
              whileTap={{ scale: 0.98 }}
              onClick={() => onChange(option.value)}
              className={cn(
                "w-full flex items-center gap-3 p-2 rounded-lg transition-colors",
                value === option.value
                  ? "bg-primary/10 text-primary"
                  : "hover:bg-muted"
              )}
            >
              <option.icon className="w-4 h-4" />
              <div className="text-left">
                <p className="text-sm font-medium">{option.label}</p>
                <p className="text-xs text-muted-foreground">{option.description}</p>
              </div>
            </motion.button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
};
