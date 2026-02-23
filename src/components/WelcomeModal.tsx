import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Sparkles, MessageSquare, Image, FileText, Mic, Brain } from "lucide-react";

interface WelcomeModalProps {
  open: boolean;
  onClose: () => void;
}

export const WelcomeModal = ({ open, onClose }: WelcomeModalProps) => {
  const features = [
    {
      icon: MessageSquare,
      title: "Smart Chat",
      description: "Persistent conversations with multiple AI models"
    },
    {
      icon: Image,
      title: "Image Generation",
      description: "Create stunning images with AI"
    },
    {
      icon: FileText,
      title: "Document Analysis",
      description: "Upload and analyze documents with AI"
    },
    {
      icon: Mic,
      title: "Voice Input",
      description: "Speak your messages and hear AI responses"
    },
    {
      icon: Brain,
      title: "Smart Memory",
      description: "AI remembers context across sessions"
    },
  ];

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <div className="flex items-center gap-2 mb-2">
            <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-primary-foreground" />
            </div>
            <DialogTitle className="text-2xl">Welcome to CoreAI</DialogTitle>
          </div>
          <DialogDescription className="text-base">
            Your ChatGPT-inspired AI assistant with powerful features
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-6">
          {features.map((feature) => (
            <div key={feature.title} className="flex gap-3 p-3 rounded-lg border bg-card">
              <feature.icon className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="font-medium text-sm mb-1">{feature.title}</h3>
                <p className="text-xs text-muted-foreground">{feature.description}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="space-y-3 text-sm text-muted-foreground border-t pt-4">
          <p>
            <strong>Privacy First:</strong> CoreAI uses both hosted and local models. 
            Configure local models in Settings for complete privacy.
          </p>
          <p>
            <strong>Keyboard Shortcuts:</strong> Press Ctrl+? to see all shortcuts
          </p>
        </div>

        <Button onClick={onClose} className="w-full">
          Get Started
        </Button>
      </DialogContent>
    </Dialog>
  );
};