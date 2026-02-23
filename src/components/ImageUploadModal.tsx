import { useState, useRef, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Upload, X, ImagePlus, Sparkles, Download, Share2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface ImageUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  styleName: string;
  styleImage?: string;
  isCelebrityStyle?: boolean;
  discoverText?: string;
}

const ImageUploadModal = ({ 
  isOpen, 
  onClose, 
  styleName, 
  styleImage,
  isCelebrityStyle = false,
  discoverText
}: ImageUploadModalProps) => {
  const [userImage, setUserImage] = useState<string | null>(null);
  const [celebrityImage, setCelebrityImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [transformedImage, setTransformedImage] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const userInputRef = useRef<HTMLInputElement>(null);
  const celebrityInputRef = useRef<HTMLInputElement>(null);

  // Animate progress bar during processing
  useEffect(() => {
    if (!isProcessing) {
      setProgress(0);
      return;
    }

    // Start at 10% immediately
    setProgress(10);
    
    const interval = setInterval(() => {
      setProgress(prev => {
        // Slow down as we approach 90%
        if (prev >= 90) return prev;
        if (prev >= 70) return prev + 1;
        if (prev >= 50) return prev + 2;
        return prev + 3;
      });
    }, 300);

    return () => clearInterval(interval);
  }, [isProcessing]);

  const handleImageUpload = (
    e: React.ChangeEvent<HTMLInputElement>, 
    setImage: (url: string | null) => void
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        toast.error("Please select a valid image file");
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        toast.error("Image size must be less than 10MB");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleApplyStyle = async () => {
    if (!userImage) {
      toast.error("Please upload an image first");
      return;
    }
    if (isCelebrityStyle && !celebrityImage) {
      toast.error("Please upload a celebrity image as well");
      return;
    }

    setIsProcessing(true);
    setTransformedImage(null);

    try {
      const { data: session } = await supabase.auth.getSession();
      const authToken = session?.session?.access_token;

      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/style-transform`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken || import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          'apikey': import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
        },
        body: JSON.stringify({
          imageUrl: userImage,
          styleName: discoverText || styleName,
          secondImageUrl: isCelebrityStyle ? celebrityImage : undefined,
          isDiscover: !!discoverText
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        if (response.status === 429) {
          throw new Error("Rate limit exceeded. Please try again later.");
        }
        if (response.status === 402) {
          throw new Error("Usage limit reached. Please add credits.");
        }
        throw new Error(errorData.error || "Failed to transform image");
      }

      const data = await response.json();
      
      if (data.transformedImageUrl) {
        setProgress(100);
        setTransformedImage(data.transformedImageUrl);
        toast.success("Style applied successfully!");
      } else {
        throw new Error("No transformed image received");
      }

    } catch (error) {
      console.error('Style transform error:', error);
      toast.error(error instanceof Error ? error.message : "Failed to apply style");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = () => {
    if (!transformedImage) return;
    
    const link = document.createElement('a');
    link.href = transformedImage;
    link.download = `${styleName.replace(/\s+/g, '-').toLowerCase()}-styled.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Image downloaded!");
  };

  const handleShare = async () => {
    if (!transformedImage) return;

    try {
      // Convert base64 to blob for sharing
      const response = await fetch(transformedImage);
      const blob = await response.blob();
      const file = new File([blob], `${styleName}-styled.png`, { type: 'image/png' });

      if (navigator.share && navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: `${styleName} Style Image`,
          text: `Check out my ${styleName} styled image!`
        });
      } else {
        // Fallback: copy to clipboard
        await navigator.clipboard.writeText(transformedImage);
        toast.success("Image URL copied to clipboard!");
      }
    } catch (error) {
      console.error('Share error:', error);
      toast.error("Failed to share image");
    }
  };

  const handleClose = () => {
    setUserImage(null);
    setCelebrityImage(null);
    setTransformedImage(null);
    onClose();
  };

  const removeImage = (setImage: (url: string | null) => void) => {
    setImage(null);
  };

  const handleReset = () => {
    setTransformedImage(null);
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg mx-auto bg-background border-border max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-foreground flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            {discoverText || styleName}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Show Transformed Result */}
          {transformedImage ? (
            <div className="space-y-4">
              <div className="rounded-xl overflow-hidden border border-border">
                <img 
                  src={transformedImage} 
                  alt="Transformed"
                  className="w-full object-contain max-h-80"
                />
              </div>
              
              {/* Action Buttons */}
              <div className="flex gap-3">
                <Button onClick={handleDownload} className="flex-1 gap-2">
                  <Download className="w-4 h-4" />
                  Download
                </Button>
                <Button onClick={handleShare} variant="outline" className="flex-1 gap-2">
                  <Share2 className="w-4 h-4" />
                  Share
                </Button>
              </div>
              
              <Button onClick={handleReset} variant="ghost" className="w-full">
                Try Another Image
              </Button>
            </div>
          ) : (
            <>
              {/* Example/Style Preview */}
              {styleImage && (
                <div className="rounded-xl overflow-hidden border border-border">
                  <img 
                    src={styleImage} 
                    alt={styleName}
                    className="w-full h-32 object-cover"
                  />
                  <div className="p-2 bg-muted/50">
                    <p className="text-xs text-muted-foreground text-center">Style Preview</p>
                  </div>
                </div>
              )}

              {/* Upload Instructions */}
              <p className="text-sm text-muted-foreground text-center">
                {isCelebrityStyle 
                  ? "Upload your image and a celebrity image to merge them"
                  : "Upload your image to apply this style"
                }
              </p>

              {/* User Image Upload */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">
                  {isCelebrityStyle ? "Your Photo" : "Upload Image"}
                </label>
                <input 
                  ref={userInputRef}
                  type="file" 
                  accept="image/*" 
                  onChange={(e) => handleImageUpload(e, setUserImage)}
                  className="hidden"
                />
                {userImage ? (
                  <div className="relative rounded-xl overflow-hidden border border-border">
                    <img 
                      src={userImage} 
                      alt="User upload"
                      className="w-full h-40 object-cover"
                    />
                    <button
                      onClick={() => removeImage(setUserImage)}
                      className="absolute top-2 right-2 p-1.5 rounded-full bg-background/80 hover:bg-background transition-colors"
                    >
                      <X className="w-4 h-4 text-foreground" />
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => userInputRef.current?.click()}
                    className="w-full h-40 border-2 border-dashed border-border rounded-xl flex flex-col items-center justify-center gap-3 hover:border-primary/50 hover:bg-muted/30 transition-colors"
                  >
                    <div className="p-3 rounded-full bg-primary/10">
                      <Upload className="w-6 h-6 text-primary" />
                    </div>
                    <span className="text-sm text-muted-foreground">Click to upload your image</span>
                  </button>
                )}
              </div>

              {/* Celebrity Image Upload (only for Celebrity Style) */}
              {isCelebrityStyle && (
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Celebrity Photo</label>
                  <input 
                    ref={celebrityInputRef}
                    type="file" 
                    accept="image/*" 
                    onChange={(e) => handleImageUpload(e, setCelebrityImage)}
                    className="hidden"
                  />
                  {celebrityImage ? (
                    <div className="relative rounded-xl overflow-hidden border border-border">
                      <img 
                        src={celebrityImage} 
                        alt="Celebrity upload"
                        className="w-full h-40 object-cover"
                      />
                      <button
                        onClick={() => removeImage(setCelebrityImage)}
                        className="absolute top-2 right-2 p-1.5 rounded-full bg-background/80 hover:bg-background transition-colors"
                      >
                        <X className="w-4 h-4 text-foreground" />
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => celebrityInputRef.current?.click()}
                      className="w-full h-40 border-2 border-dashed border-border rounded-xl flex flex-col items-center justify-center gap-3 hover:border-primary/50 hover:bg-muted/30 transition-colors"
                    >
                      <div className="p-3 rounded-full bg-primary/10">
                        <ImagePlus className="w-6 h-6 text-primary" />
                      </div>
                      <span className="text-sm text-muted-foreground">Click to upload celebrity image</span>
                    </button>
                  )}
                </div>
              )}

              {/* Apply Button with Progress */}
              {isProcessing ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Applying style...</span>
                    <span className="text-primary font-medium">{progress}%</span>
                  </div>
                  <Progress value={progress} className="h-2" />
                  <p className="text-xs text-muted-foreground text-center">
                    AI is transforming your image, please wait...
                  </p>
                </div>
              ) : (
                <Button 
                  onClick={handleApplyStyle}
                  disabled={!userImage || (isCelebrityStyle && !celebrityImage)}
                  className="w-full h-12 text-base font-medium"
                >
                  <Sparkles className="w-5 h-5 mr-2" />
                  Apply Style
                </Button>
              )}
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ImageUploadModal;
