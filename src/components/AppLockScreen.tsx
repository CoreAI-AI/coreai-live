import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, Fingerprint, Delete, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface AppLockScreenProps {
  onUnlock: (pin: string) => boolean;
  onBiometricAuth: () => Promise<boolean>;
  biometricEnabled: boolean;
}

export const AppLockScreen = ({ 
  onUnlock, 
  onBiometricAuth, 
  biometricEnabled 
}: AppLockScreenProps) => {
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const maxLength = 6;

  const handleNumberPress = (num: string) => {
    if (pin.length < maxLength) {
      const newPin = pin + num;
      setPin(newPin);
      setError(false);

      // Auto-submit when PIN is complete
      if (newPin.length === maxLength) {
        setTimeout(() => {
          const success = onUnlock(newPin);
          if (!success) {
            setError(true);
            setAttempts(prev => prev + 1);
            setTimeout(() => {
              setPin('');
              setError(false);
            }, 500);
          }
        }, 100);
      }
    }
  };

  const handleDelete = () => {
    setPin(prev => prev.slice(0, -1));
    setError(false);
  };

  const handleBiometric = async () => {
    if (!biometricEnabled || isAuthenticating) return;
    
    setIsAuthenticating(true);
    try {
      await onBiometricAuth();
    } finally {
      setIsAuthenticating(false);
    }
  };

  // Try biometric on mount if enabled
  useEffect(() => {
    if (biometricEnabled) {
      handleBiometric();
    }
  }, []);

  const numbers = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', 'del'];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] bg-background flex flex-col items-center justify-center p-6"
    >
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-primary/10" />
      
      {/* Lock Icon */}
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="relative z-10 mb-8"
      >
        <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
          <Shield className="w-10 h-10 text-primary" />
        </div>
      </motion.div>

      {/* Title */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="relative z-10 text-center mb-8"
      >
        <h1 className="text-2xl font-bold mb-2">App Locked</h1>
        <p className="text-muted-foreground text-sm">
          Enter your PIN to unlock
        </p>
      </motion.div>

      {/* PIN Dots */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3 }}
        className={cn(
          "relative z-10 flex gap-4 mb-8",
          error && "animate-shake"
        )}
      >
        {Array.from({ length: maxLength }).map((_, i) => (
          <motion.div
            key={i}
            animate={pin.length > i ? { scale: [1, 1.2, 1] } : {}}
            className={cn(
              "w-4 h-4 rounded-full border-2 transition-all duration-200",
              pin.length > i 
                ? error 
                  ? "bg-destructive border-destructive" 
                  : "bg-primary border-primary"
                : "border-muted-foreground/30"
            )}
          />
        ))}
      </motion.div>

      {/* Error Message */}
      <AnimatePresence>
        {error && (
          <motion.p
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="text-destructive text-sm mb-4"
          >
            Wrong PIN. {attempts >= 3 && `${5 - attempts} attempts remaining`}
          </motion.p>
        )}
      </AnimatePresence>

      {/* Number Pad */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="relative z-10 grid grid-cols-3 gap-4 max-w-[280px]"
      >
        {numbers.map((num, i) => (
          <div key={i} className="flex items-center justify-center">
            {num === '' ? (
              biometricEnabled ? (
                <Button
                  variant="ghost"
                  size="lg"
                  className="w-16 h-16 rounded-full"
                  onClick={handleBiometric}
                  disabled={isAuthenticating}
                >
                  <Fingerprint className={cn(
                    "w-6 h-6",
                    isAuthenticating && "animate-pulse"
                  )} />
                </Button>
              ) : (
                <div className="w-16 h-16" />
              )
            ) : num === 'del' ? (
              <Button
                variant="ghost"
                size="lg"
                className="w-16 h-16 rounded-full"
                onClick={handleDelete}
                disabled={pin.length === 0}
              >
                <Delete className="w-6 h-6" />
              </Button>
            ) : (
              <Button
                variant="outline"
                size="lg"
                className="w-16 h-16 rounded-full text-xl font-semibold hover:bg-primary hover:text-primary-foreground transition-colors"
                onClick={() => handleNumberPress(num)}
              >
                {num}
              </Button>
            )}
          </div>
        ))}
      </motion.div>

      {/* Biometric hint */}
      {biometricEnabled && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="relative z-10 text-muted-foreground text-xs mt-6"
        >
          Tap fingerprint icon for biometric unlock
        </motion.p>
      )}
    </motion.div>
  );
};
