import { motion } from "framer-motion";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CreditCard, Smartphone } from "lucide-react";

interface PaymentMethodSelectorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onPaymentComplete: () => void;
}

export const PaymentMethodSelector = ({ 
  open, 
  onOpenChange, 
  onPaymentComplete 
}: PaymentMethodSelectorProps) => {
  const paymentMethods = [
    { name: "PhonePe", icon: Smartphone, color: "bg-purple-600" },
    { name: "BharatPe", icon: Smartphone, color: "bg-blue-600" },
    { name: "PayPal", icon: CreditCard, color: "bg-blue-500" },
    { name: "Card Payment", icon: CreditCard, color: "bg-green-600" }
  ];

  const handlePayment = (method: string) => {
    // Simulate payment - will be replaced with real Stripe integration
    setTimeout(() => {
      onPaymentComplete();
      onOpenChange(false);
    }, 1000);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl">Choose Payment Method</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="bg-primary/10 p-4 rounded-lg text-center">
            <p className="text-2xl font-bold text-primary">₹199/month</p>
            <p className="text-sm text-muted-foreground mt-1">CoreAI Premium Subscription</p>
          </div>

          <div className="space-y-3">
            {paymentMethods.map((method, index) => (
              <motion.div
                key={method.name}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Button
                  onClick={() => handlePayment(method.name)}
                  className="w-full justify-start gap-3 h-14"
                  variant="outline"
                >
                  <div className={`w-10 h-10 rounded-lg ${method.color} flex items-center justify-center`}>
                    <method.icon className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-base font-medium">{method.name}</span>
                </Button>
              </motion.div>
            ))}
          </div>

          <p className="text-xs text-center text-muted-foreground">
            Secure payment processing. Cancel anytime.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};
