import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";
import { Card } from "@/components/ui/card";

interface AIToolCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  category: string;
  onClick?: () => void;
}

export const AIToolCard = ({ icon: Icon, title, description, category, onClick }: AIToolCardProps) => {
  return (
    <motion.div
      whileHover={{ scale: 1.02, y: -4 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
    >
      <Card 
        className="relative overflow-hidden p-6 cursor-pointer group bg-card hover:bg-card/80 border-border hover:border-primary/50 transition-all duration-300"
        onClick={onClick}
      >
        {/* Glow effect on hover */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        
        <div className="relative z-10">
          {/* Icon with glow */}
          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:core-glow transition-all duration-300">
            <Icon className="w-6 h-6 text-primary" />
          </div>
          
          {/* Category badge */}
          <span className="inline-block px-2 py-1 text-xs font-medium bg-primary/10 text-primary rounded-md mb-3">
            {category}
          </span>
          
          {/* Title */}
          <h3 className="text-lg font-semibold text-foreground mb-2 group-hover:text-primary transition-colors">
            {title}
          </h3>
          
          {/* Description */}
          <p className="text-sm text-muted-foreground line-clamp-2">
            {description}
          </p>
        </div>
      </Card>
    </motion.div>
  );
};
