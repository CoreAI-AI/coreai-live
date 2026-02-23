import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send, Paperclip, Image, File, Camera, Search, GraduationCap, ImagePlus, Code, Lightbulb, BarChart3, Mic, Square, X, ShoppingCart, TrendingUp, Sparkles, Newspaper, Crown, Coins } from "lucide-react";
import coreaiLogo from "@/assets/coreai-logo.png";
import { toast } from "sonner";
import { Camera as CapCamera, CameraResultType, CameraSource } from '@capacitor/camera';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { chatMessageSchema, validateFile, sanitizeInput } from "@/lib/validation";
import { useVoiceRecorder } from "@/hooks/useVoiceRecorder";
import { useIsMobile } from "@/hooks/use-mobile";
interface ChatInputProps {
  onSendMessage: (message: string) => void;
  disabled?: boolean;
  onFileSelect?: (file: File) => void;
  onModeChange?: (mode: 'normal' | 'deep-search' | 'study' | 'photo' | 'code' | 'creative' | 'analyze' | 'rich' | 'poor') => void;
  editingMessage?: {
    id: string;
    content: string;
    index: number;
  } | null;
  onCancelEdit?: () => void;
  onTypingChange?: (isTyping: boolean) => void;
}
export const ChatInput = ({
  onSendMessage,
  disabled,
  onFileSelect,
  onModeChange,
  editingMessage,
  onCancelEdit,
  onTypingChange
}: ChatInputProps) => {
  const [message, setMessage] = useState("");
  const isMobile = useIsMobile();

  // Populate message when editing
  useEffect(() => {
    if (editingMessage) {
      setMessage(editingMessage.content);
    }
  }, [editingMessage]);

  // Notify parent when typing state changes
  useEffect(() => {
    onTypingChange?.(message.trim().length > 0);
  }, [message, onTypingChange]);
  const [currentMode, setCurrentMode] = useState<'normal' | 'deep-search' | 'study' | 'photo' | 'code' | 'creative' | 'analyze' | 'rich' | 'poor'>('normal');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const anyFileInputRef = useRef<HTMLInputElement>(null);
  const {
    isRecording,
    transcribing,
    startRecording,
    stopRecording,
    transcribe,
    reset
  } = useVoiceRecorder();

  // Special quick mode actions for mobile (sends prompt directly)
  const handleQuickMode = (prompt: string, modeName: string) => {
    onSendMessage(prompt);
    toast.success(`${modeName} activated!`);
  };
  const handleModeSelect = (mode: 'normal' | 'deep-search' | 'study' | 'photo' | 'code' | 'creative' | 'analyze' | 'rich' | 'poor') => {
    setCurrentMode(mode);
    if (onModeChange) {
      onModeChange(mode);
    }
    const modeNames: Record<string, string> = {
      'normal': 'Normal Chat',
      'deep-search': 'Deep Research',
      'study': 'Study Tutor',
      'photo': 'Image Generator',
      'code': 'Code Assistant',
      'creative': 'Creative Writer',
      'analyze': 'Data Analyst',
      'rich': 'Rich Mode',
      'poor': 'Poor Mode'
    };
    toast.success(`${modeNames[mode]} activated!`);
  };
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || disabled) return;

    // Validate and sanitize message
    try {
      const sanitized = sanitizeInput(message);
      chatMessageSchema.parse({
        content: sanitized
      });
      onSendMessage(sanitized);
      setMessage("");
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error("Invalid message");
      }
    }
  };
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && onFileSelect) {
      try {
        validateFile(file);
        onFileSelect(file);
      } catch (error) {
        if (error instanceof Error) {
          toast.error(error.message);
        } else {
          toast.error("Invalid file");
        }
      }
    }
  };
  const openGallery = () => {
    fileInputRef.current?.click();
  };
  const openCamera = async () => {
    try {
      const image = await CapCamera.getPhoto({
        quality: 80,
        allowEditing: false,
        resultType: CameraResultType.DataUrl,
        source: CameraSource.Camera,
        saveToGallery: false,
        correctOrientation: true
      });
      if (image.dataUrl && onFileSelect) {
        const response = await fetch(image.dataUrl);
        const blob = await response.blob();
        const timestamp = Date.now();
        const fileObj = Object.assign(blob, {
          name: `camera-${timestamp}.jpg`,
          lastModified: timestamp
        }) as File;
        onFileSelect(fileObj);
      }
    } catch (error: any) {
      console.error('Camera error:', error);
      toast.error('Camera access denied. Please allow camera permissions.');
    }
  };
  const openFileExplorer = () => {
    anyFileInputRef.current?.click();
  };
  const handleVoiceRecording = async () => {
    if (isRecording) {
      stopRecording();
      const text = await transcribe();
      if (text) {
        setMessage(text);
        toast.success("Voice transcribed!");
      }
      reset();
    } else {
      await startRecording();
    }
  };
  const getModeIcon = () => {
    switch (currentMode) {
      case 'deep-search':
        return <Search className="h-5 w-5 text-blue-500" />;
      case 'study':
        return <GraduationCap className="h-5 w-5 text-green-500" />;
      case 'photo':
        return <ImagePlus className="h-5 w-5 text-purple-500" />;
      case 'code':
        return <Code className="h-5 w-5 text-orange-500" />;
      case 'creative':
        return <Lightbulb className="h-5 w-5 text-yellow-500" />;
      case 'analyze':
        return <BarChart3 className="h-5 w-5 text-cyan-500" />;
      case 'rich':
        return <Crown className="h-5 w-5 text-amber-500" />;
      case 'poor':
        return <Coins className="h-5 w-5 text-gray-500" />;
      default:
        return <img src={coreaiLogo} alt="CoreAI" className="h-6 w-6 rounded-full" />;
    }
  };
  return <div className="border-t border-border bg-background/80 backdrop-blur-xl p-2 sm:p-4">
      <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
      <input ref={anyFileInputRef} type="file" onChange={handleFileChange} className="hidden" />
      
      <div className="max-w-4xl mx-auto">
        <form onSubmit={handleSubmit} className="relative">
          {/* Main input container */}
          <div className="flex items-end gap-1.5 sm:gap-2 bg-card border border-border rounded-2xl p-1.5 sm:p-2 shadow-sm focus-within:border-primary/50 focus-within:shadow-md transition-all duration-200">
            {/* Mode selector */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button type="button" size="icon" variant="ghost" className="h-9 w-9 sm:h-10 sm:w-10 rounded-xl text-muted-foreground hover:text-foreground hover:bg-accent shrink-0 btn-press">
                  {getModeIcon()}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-56 p-2 max-h-[70vh] overflow-y-auto">
                {/* Mobile-only Quick Modes */}
                {isMobile && <>
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-2 py-1 mb-1">Quick Modes</p>
                    <DropdownMenuItem onClick={() => handleQuickMode("Help me with shopping research. I want to find the best products and deals for my needs.", "Shopping Mode")} className="cursor-pointer rounded-lg">
                      <ShoppingCart className="w-4 h-4 mr-2 text-orange-500" />
                      Shopping Mode
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleQuickMode("Help me with financial research. Provide market analysis and investment insights.", "Financial Mode")} className="cursor-pointer rounded-lg">
                      <TrendingUp className="w-4 h-4 mr-2 text-green-500" />
                      Financial Mode
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleQuickMode("Help me with beauty and skincare advice. Provide product recommendations and tips.", "Beauty Mode")} className="cursor-pointer rounded-lg">
                      <Sparkles className="w-4 h-4 mr-2 text-pink-500" />
                      Beauty Mode
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleQuickMode("Give me today's top news and important updates from around the world.", "Today News")} className="cursor-pointer rounded-lg">
                      <Newspaper className="w-4 h-4 mr-2 text-purple-500" />
                      Today News
                    </DropdownMenuItem>
                    <div className="h-px bg-border my-2" />
                  </>}
                
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-2 py-1 mb-1">AI Modes</p>
                <DropdownMenuItem onClick={() => handleModeSelect('normal')} className="cursor-pointer rounded-lg">
                  <img src={coreaiLogo} alt="CoreAI" className="w-4 h-4 mr-2 rounded-full" />
                  Normal Chat
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleModeSelect('deep-search')} className="cursor-pointer rounded-lg">
                  <Search className="w-4 h-4 mr-2 text-blue-500" />
                  Deep Research
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleModeSelect('study')} className="cursor-pointer rounded-lg">
                  <GraduationCap className="w-4 h-4 mr-2 text-green-500" />
                  Study Tutor
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleModeSelect('code')} className="cursor-pointer rounded-lg">
                  <Code className="w-4 h-4 mr-2 text-orange-500" />
                  Code Assistant
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleModeSelect('creative')} className="cursor-pointer rounded-lg">
                  <Lightbulb className="w-4 h-4 mr-2 text-yellow-500" />
                  Creative Writer
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleModeSelect('analyze')} className="cursor-pointer rounded-lg">
                  <BarChart3 className="w-4 h-4 mr-2 text-cyan-500" />
                  Data Analyst
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleModeSelect('photo')} className="cursor-pointer rounded-lg">
                  <ImagePlus className="w-4 h-4 mr-2 text-purple-500" />
                  Image Generator
                </DropdownMenuItem>
                
                <div className="h-px bg-border my-2" />
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-2 py-1 mb-1">Mindset Modes</p>
                
                <DropdownMenuItem onClick={() => handleModeSelect('rich')} className="cursor-pointer rounded-lg">
                  <Crown className="w-4 h-4 mr-2 text-amber-500" />
                  Rich Mode
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleModeSelect('poor')} className="cursor-pointer rounded-lg">
                  <Coins className="w-4 h-4 mr-2 text-gray-500" />
                  Poor Mode
                </DropdownMenuItem>
                
                <div className="h-px bg-border my-2" />
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-2 py-1 mb-1">Attach</p>
                
                <DropdownMenuItem onClick={openGallery} className="cursor-pointer rounded-lg">
                  <Image className="w-4 h-4 mr-2" />
                  Gallery
                </DropdownMenuItem>
                <DropdownMenuItem onClick={openFileExplorer} className="cursor-pointer rounded-lg">
                  <File className="w-4 h-4 mr-2" />
                  File
                </DropdownMenuItem>
                <DropdownMenuItem onClick={openCamera} className="cursor-pointer rounded-lg" data-camera-upload>
                  <Camera className="w-4 h-4 mr-2" />
                  Camera
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            
            {/* Text input area */}
            <div className="flex-1 min-w-0 relative">
              {editingMessage && <div className="flex items-center gap-2 text-xs text-primary mb-2 font-medium bg-primary/10 px-3 py-1.5 rounded-lg">
                  <span>Editing message</span>
                  <Button type="button" variant="ghost" size="sm" onClick={() => {
                onCancelEdit?.();
                setMessage("");
              }} className="h-5 w-5 p-0 text-primary hover:text-primary/80">
                    <X className="w-3 h-3" />
                  </Button>
                </div>}
              <Textarea value={message} onChange={e => setMessage(e.target.value)} onKeyDown={handleKeyDown} placeholder={editingMessage ? "Edit your message..." : currentMode === 'photo' ? "Describe the image you want to generate..." : currentMode === 'study' ? "Ask me to explain any topic..." : currentMode === 'deep-search' ? "Ask for in-depth research..." : currentMode === 'code' ? "Ask for coding help..." : currentMode === 'creative' ? "Let's create something amazing..." : currentMode === 'analyze' ? "Share data or info to analyze..." : currentMode === 'rich' ? "Ask about wealth, investments, luxury..." : currentMode === 'poor' ? "Ask about saving, budgeting, survival tips..." : disabled ? "AI is thinking..." : "Message CoreAI..."} disabled={disabled} className="min-h-[40px] sm:min-h-[44px] max-h-32 resize-none bg-transparent border-0 shadow-none text-sm sm:text-base text-foreground placeholder:text-muted-foreground focus-visible:ring-0 focus-visible:ring-offset-0 py-2 sm:py-2.5 px-0" rows={1} />
            </div>
            
            {/* Action buttons - always visible */}
            <div className="flex items-center gap-0.5 sm:gap-1 shrink-0">
              {/* Voice button */}
              <Button 
                type="button" 
                size="icon" 
                variant="ghost"
                onClick={handleVoiceRecording}
                disabled={disabled || transcribing}
                data-voice-input
                className={`h-9 w-9 sm:h-10 sm:w-10 rounded-xl btn-press ${isRecording ? 'bg-red-500/20 text-red-500 hover:bg-red-500/30' : 'text-muted-foreground hover:text-foreground hover:bg-accent'}`}
              >
                {isRecording ? <Square className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
              </Button>

              {/* Send button */}
              <Button type="submit" size="icon" disabled={disabled || !message.trim()} className="h-9 w-9 sm:h-10 sm:w-10 rounded-xl gradient-bg text-white hover:opacity-90 btn-press shadow-md disabled:opacity-50 disabled:shadow-none">
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </form>
        
        {/* Powered by text */}
        <p className="text-center text-xs text-muted-foreground mt-3">
          Powered by <span className="font-medium gradient-text">CoreAI</span> • Fast, intelligent, reliable
        </p>
      </div>
    </div>;
};