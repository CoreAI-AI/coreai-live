import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, Sparkles } from 'lucide-react';
import { useState, useEffect } from 'react';

interface ImageGeneratingOverlayProps {
  isGenerating: boolean;
  prompt?: string;
}

export const ImageGeneratingOverlay = ({ isGenerating, prompt }: ImageGeneratingOverlayProps) => {
  const [progress, setProgress] = useState(0);
  const [stage, setStage] = useState<'initializing' | 'processing' | 'rendering' | 'finalizing'>('initializing');
  
  // Estimated total time in seconds (typical image generation)
  const estimatedTotalTime = 15;
  
  useEffect(() => {
    if (!isGenerating) {
      setProgress(0);
      setStage('initializing');
      return;
    }
    
    // Simulate progress with realistic stages
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 95) return prev; // Cap at 95% until complete
        
        // Different speeds for different stages
        let increment = 1;
        if (prev < 20) {
          increment = 3; // Fast start
          setStage('initializing');
        } else if (prev < 50) {
          increment = 2; // Medium during processing
          setStage('processing');
        } else if (prev < 80) {
          increment = 1.5; // Slower during rendering
          setStage('rendering');
        } else {
          increment = 0.5; // Very slow at the end
          setStage('finalizing');
        }
        
        return Math.min(prev + increment, 95);
      });
    }, 300);
    
    return () => clearInterval(interval);
  }, [isGenerating]);
  
  // Calculate remaining time
  const remainingSeconds = Math.max(1, Math.round((100 - progress) / 100 * estimatedTotalTime));
  
  const stageLabels = {
    initializing: 'Initializing AI model...',
    processing: 'Processing your prompt...',
    rendering: 'Rendering image...',
    finalizing: 'Adding final touches...'
  };

  return (
    <AnimatePresence>
      {isGenerating && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="relative flex flex-col items-center gap-6 p-8"
          >
            {/* Blurred placeholder card */}
            <div className="relative w-72 h-72 sm:w-80 sm:h-80 rounded-2xl overflow-hidden">
              {/* Animated gradient background */}
              <motion.div
                className="absolute inset-0 bg-gradient-to-br from-primary/20 via-accent/20 to-secondary/20"
                animate={{
                  background: [
                    'linear-gradient(135deg, hsl(var(--primary)/0.2), hsl(var(--accent)/0.2), hsl(var(--secondary)/0.2))',
                    'linear-gradient(225deg, hsl(var(--secondary)/0.2), hsl(var(--primary)/0.2), hsl(var(--accent)/0.2))',
                    'linear-gradient(315deg, hsl(var(--accent)/0.2), hsl(var(--secondary)/0.2), hsl(var(--primary)/0.2))',
                    'linear-gradient(135deg, hsl(var(--primary)/0.2), hsl(var(--accent)/0.2), hsl(var(--secondary)/0.2))',
                  ]
                }}
                transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
              />
              
              {/* Blur overlay with noise texture effect */}
              <div className="absolute inset-0 backdrop-blur-xl bg-muted/30" />
              
              {/* Animated shimmer effect */}
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
                animate={{ x: ['-100%', '100%'] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
              />
              
              {/* Center loading indicator with percentage */}
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                >
                  <Sparkles className="w-10 h-10 text-primary" />
                </motion.div>
                
                {/* Percentage display */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-4xl font-bold text-primary"
                >
                  {Math.round(progress)}%
                </motion.div>
              </div>
              
              {/* Corner decorations */}
              <div className="absolute top-3 left-3 w-8 h-8 border-l-2 border-t-2 border-primary/40 rounded-tl-lg" />
              <div className="absolute top-3 right-3 w-8 h-8 border-r-2 border-t-2 border-primary/40 rounded-tr-lg" />
              <div className="absolute bottom-3 left-3 w-8 h-8 border-l-2 border-b-2 border-primary/40 rounded-bl-lg" />
              <div className="absolute bottom-3 right-3 w-8 h-8 border-r-2 border-b-2 border-primary/40 rounded-br-lg" />
            </div>
            
            {/* Progress bar */}
            <div className="w-72 sm:w-80">
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-primary via-primary/80 to-primary rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.3, ease: "easeOut" }}
                />
              </div>
              
              {/* Stage label and time estimate */}
              <div className="flex justify-between items-center mt-2 px-1">
                <span className="text-xs text-muted-foreground">{stageLabels[stage]}</span>
                <span className="text-xs text-muted-foreground">~{remainingSeconds}s remaining</span>
              </div>
            </div>
            
            {/* Loading text */}
            <div className="flex flex-col items-center gap-2">
              <div className="flex items-center gap-2">
                <Loader2 className="w-5 h-5 animate-spin text-primary" />
                <span className="text-lg font-medium text-foreground">Creating your image...</span>
              </div>
              {prompt && (
                <p className="text-sm text-muted-foreground text-center max-w-xs line-clamp-2">
                  "{prompt}"
                </p>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};