import { motion } from "framer-motion";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Diamond, Check } from "lucide-react";

interface SubscriptionPopupProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpgrade: () => void;
}

export const SubscriptionPopup = ({ open, onOpenChange, onUpgrade }: SubscriptionPopupProps) => {
  const benefits = [
    "Access all 3 Premium AI Models",
    "Chat-Pro Ultra Advance Model",
    "Image, Video, Web & App Prompt",
    "Image Generator Expert",
    "Full A to Z Automation",
    "Unlimited Smart Chat",
    "Priority Response",
    "Premium Diamond Mode Experience"
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl">
            <Diamond className="w-6 h-6 text-primary" />
            CoreAI Premium Subscription
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <p className="text-muted-foreground">
            Unlock all advanced AI models and premium features instantly.
          </p>

          <div className="space-y-3">
            {benefits.map((benefit, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="flex items-start gap-2"
              >
                <Check className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                <span className="text-sm">{benefit}</span>
              </motion.div>
            ))}
          </div>

          <div className="bg-primary/10 p-4 rounded-lg text-center">
            <p className="text-2xl font-bold text-primary">₹199/month</p>
            <p className="text-sm text-muted-foreground mt-1">Full access to all premium features</p>
          </div>

          <p className="text-sm text-center text-muted-foreground">
            Upgrade now to experience full CoreAI power.
          </p>

          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1"
            >
              Not Now
            </Button>
            <Button
              onClick={onUpgrade}
              className="flex-1 bg-primary hover:bg-primary/90"
            >
              Upgrade Now
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
