import { motion } from 'framer-motion';
import coreaiLogo from '@/assets/coreai-logo.png';

interface SplashScreenProps {
  onComplete?: () => void;
}

export const SplashScreen = ({ onComplete }: SplashScreenProps) => {
  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center bg-background overflow-hidden"
      initial={{ opacity: 1 }}
      animate={{ opacity: 0 }}
      transition={{ duration: 0.6, delay: 2.2, ease: "easeInOut" }}
      onAnimationComplete={onComplete}
    >
      {/* Animated background particles */}
      <div className="absolute inset-0">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 rounded-full bg-primary/20"
            initial={{
              x: Math.random() * window.innerWidth,
              y: Math.random() * window.innerHeight,
              scale: 0,
            }}
            animate={{
              scale: [0, 1, 0],
              opacity: [0, 0.5, 0],
            }}
            transition={{
              duration: 2,
              delay: Math.random() * 1.5,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>

      {/* Radial gradient backdrop */}
      <motion.div
        className="absolute inset-0"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
        style={{
          background: 'radial-gradient(circle at center, hsl(var(--primary) / 0.1) 0%, transparent 60%)',
        }}
      />

      <motion.div
        className="flex flex-col items-center gap-6 relative z-10"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      >
        {/* Premium Logo with multiple layers */}
        <motion.div 
          className="relative"
          initial={{ rotate: -180, scale: 0 }}
          animate={{ rotate: 0, scale: 1 }}
          transition={{ 
            duration: 0.8, 
            ease: [0.22, 1, 0.36, 1],
            delay: 0.2 
          }}
        >
          {/* Outer rotating ring */}
          <motion.div
            className="absolute -inset-6 rounded-full border-2 border-primary/30"
            animate={{ rotate: 360 }}
            transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
          />
          
          {/* Middle pulsing ring */}
          <motion.div
            className="absolute -inset-4 rounded-full border border-primary/40"
            animate={{ scale: [1, 1.1, 1], opacity: [0.4, 0.6, 0.4] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          />

          {/* Glow effect */}
          <motion.div 
            className="absolute inset-0 w-24 h-24 rounded-full blur-2xl bg-primary"
            animate={{ 
              opacity: [0.3, 0.5, 0.3],
              scale: [1, 1.2, 1]
            }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          />
          
          {/* Main logo with bounce */}
          <motion.img 
            src={coreaiLogo} 
            alt="CoreAI Logo" 
            className="relative w-24 h-24 rounded-full shadow-2xl"
            animate={{ 
              y: [0, -5, 0]
            }}
            transition={{ 
              duration: 2, 
              repeat: Infinity, 
              ease: "easeInOut",
              delay: 0.8
            }}
          />
        </motion.div>
        
        {/* Brand name with staggered reveal */}
        <motion.div
          className="flex flex-col items-center gap-2"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6, ease: "easeOut" }}
        >
          <motion.h1 
            className="text-4xl font-bold"
            initial={{ opacity: 0, letterSpacing: "0.5em" }}
            animate={{ opacity: 1, letterSpacing: "0.05em" }}
            transition={{ duration: 0.8, delay: 0.8 }}
          >
            <span className="gradient-text">CoreAI</span>
          </motion.h1>
          <motion.p 
            className="text-sm text-muted-foreground font-medium tracking-wider"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 1.2 }}
          >
            Intelligent Assistant
          </motion.p>
        </motion.div>

        {/* Loading bar instead of dots */}
        <motion.div
          className="w-48 h-1 rounded-full bg-muted overflow-hidden"
          initial={{ opacity: 0, scaleX: 0 }}
          animate={{ opacity: 1, scaleX: 1 }}
          transition={{ delay: 1.4, duration: 0.4 }}
        >
          <motion.div
            className="h-full gradient-bg rounded-full"
            initial={{ x: "-100%" }}
            animate={{ x: "100%" }}
            transition={{ 
              duration: 1.5, 
              repeat: 1,
              ease: "easeInOut",
              delay: 1.5
            }}
          />
        </motion.div>
      </motion.div>
    </motion.div>
  );
};
