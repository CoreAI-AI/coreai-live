import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Lock, Fingerprint, Check, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface AppLockSetupProps {
  onComplete: (pin: string) => void;
  onCancel: () => void;
}

type SetupStep = 'enter' | 'confirm';

export const AppLockSetup = ({ onComplete, onCancel }: AppLockSetupProps) => {
  const [step, setStep] = useState<SetupStep>('enter');
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [error, setError] = useState(false);
  const maxLength = 6;

  const currentPin = step === 'enter' ? pin : confirmPin;
  const setCurrentPin = step === 'enter' ? setPin : setConfirmPin;

  const handleNumberPress = (num: string) => {
    if (currentPin.length < maxLength) {
      const newPin = currentPin + num;
      setCurrentPin(newPin);
      setError(false);

      // Auto-advance when PIN is complete
      if (newPin.length === maxLength) {
        setTimeout(() => {
          if (step === 'enter') {
            setStep('confirm');
          } else {
            // Verify PINs match
            if (newPin === pin) {
              onComplete(newPin);
            } else {
              setError(true);
              setTimeout(() => {
                setConfirmPin('');
                setError(false);
              }, 500);
            }
          }
        }, 200);
      }
    }
  };

  const handleDelete = () => {
    setCurrentPin(prev => prev.slice(0, -1));
    setError(false);
  };

  const handleBack = () => {
    if (step === 'confirm') {
      setStep('enter');
      setConfirmPin('');
      setPin('');
    } else {
      onCancel();
    }
  };

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
      
      {/* Back Button */}
      <Button
        variant="ghost"
        size="icon"
        className="absolute top-4 left-4 z-20"
        onClick={handleBack}
      >
        <ArrowLeft className="w-5 h-5" />
      </Button>

      {/* Progress Indicator */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="relative z-10 flex gap-2 mb-6"
      >
        <div className={cn(
          "w-8 h-1 rounded-full transition-colors",
          step === 'enter' ? "bg-primary" : "bg-primary"
        )} />
        <div className={cn(
          "w-8 h-1 rounded-full transition-colors",
          step === 'confirm' ? "bg-primary" : "bg-muted"
        )} />
      </motion.div>

      {/* Icon */}
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="relative z-10 mb-6"
      >
        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
          {step === 'enter' ? (
            <Lock className="w-8 h-8 text-primary" />
          ) : (
            <Check className="w-8 h-8 text-primary" />
          )}
        </div>
      </motion.div>

      {/* Title */}
      <motion.div
        key={step}
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="relative z-10 text-center mb-6"
      >
        <h1 className="text-xl font-bold mb-1">
          {step === 'enter' ? 'Create PIN' : 'Confirm PIN'}
        </h1>
        <p className="text-muted-foreground text-sm">
          {step === 'enter' 
            ? 'Enter a 6-digit PIN' 
            : 'Re-enter your PIN to confirm'}
        </p>
      </motion.div>

      {/* PIN Dots */}
      <motion.div
        key={`dots-${step}`}
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className={cn(
          "relative z-10 flex gap-3 mb-6",
          error && "animate-shake"
        )}
      >
        {Array.from({ length: maxLength }).map((_, i) => (
          <motion.div
            key={i}
            animate={currentPin.length > i ? { scale: [1, 1.2, 1] } : {}}
            className={cn(
              "w-3.5 h-3.5 rounded-full border-2 transition-all duration-200",
              currentPin.length > i 
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
            PINs don't match. Try again.
          </motion.p>
        )}
      </AnimatePresence>

      {/* Number Pad */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="relative z-10 grid grid-cols-3 gap-3 max-w-[260px]"
      >
        {numbers.map((num, i) => (
          <div key={i} className="flex items-center justify-center">
            {num === '' ? (
              <div className="w-14 h-14" />
            ) : num === 'del' ? (
              <Button
                variant="ghost"
                size="lg"
                className="w-14 h-14 rounded-full text-muted-foreground"
                onClick={handleDelete}
                disabled={currentPin.length === 0}
              >
                ←
              </Button>
            ) : (
              <Button
                variant="outline"
                size="lg"
                className="w-14 h-14 rounded-full text-lg font-semibold hover:bg-primary hover:text-primary-foreground transition-colors"
                onClick={() => handleNumberPress(num)}
              >
                {num}
              </Button>
            )}
          </div>
        ))}
      </motion.div>
    </motion.div>
  );
};
