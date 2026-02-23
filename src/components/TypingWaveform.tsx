import { motion } from 'framer-motion';
import coreaiLogo from '@/assets/coreai-logo.png';

interface TypingWaveformProps {
  show: boolean;
}

export const TypingWaveform = ({ show }: TypingWaveformProps) => {
  if (!show) return null;

  const bars = 5;
  
  return (
    <motion.div 
      className="flex mb-6 group"
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -10, scale: 0.95 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
    >
      {/* AI avatar with CoreAI logo */}
      <motion.div 
        className="mr-3 flex items-start shrink-0"
        initial={{ scale: 0, rotate: 45 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
      >
        <img 
          src={coreaiLogo} 
          alt="CoreAI" 
          className="w-9 h-9 rounded-full shadow-md ring-2 ring-background" 
        />
      </motion.div>
      
      <motion.div 
        className="relative bg-card text-card-foreground rounded-2xl rounded-tl-md px-5 py-4 shadow-sm border border-border/50 overflow-visible"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.25, delay: 0.15 }}
      >
        {/* Pulsing background glow */}
        <motion.div
          className="absolute -inset-2 rounded-3xl bg-primary/20 blur-xl -z-10"
          animate={{
            opacity: [0.3, 0.6, 0.3],
            scale: [0.95, 1.05, 0.95],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute -inset-1 rounded-2xl bg-primary/10 blur-md -z-10"
          animate={{
            opacity: [0.4, 0.7, 0.4],
            scale: [0.98, 1.02, 0.98],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 0.2,
          }}
        />
        <div className="flex items-center gap-4">
          {/* Waveform bars */}
          <div className="flex items-center gap-1 h-8">
            {Array.from({ length: bars }).map((_, i) => (
              <motion.div
                key={i}
                className="w-1 bg-primary rounded-full"
                animate={{
                  height: ["8px", "24px", "12px", "28px", "8px"],
                  opacity: [0.5, 1, 0.7, 1, 0.5],
                }}
                transition={{
                  duration: 0.8 + Math.random() * 0.4,
                  repeat: Infinity,
                  repeatType: "reverse",
                  delay: i * 0.1,
                  ease: "easeInOut",
                }}
              />
            ))}
          </div>
          
          {/* Pulsing text */}
          <motion.span 
            className="text-sm font-medium text-muted-foreground"
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
          >
            AI is thinking...
          </motion.span>
          
          {/* Glowing dot indicator */}
          <motion.div
            className="w-2 h-2 rounded-full bg-primary"
            animate={{
              scale: [1, 1.5, 1],
              opacity: [0.5, 1, 0.5],
              boxShadow: [
                "0 0 0 0 hsl(var(--primary) / 0.4)",
                "0 0 0 8px hsl(var(--primary) / 0)",
                "0 0 0 0 hsl(var(--primary) / 0.4)",
              ],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        </div>
      </motion.div>
    </motion.div>
  );
};
