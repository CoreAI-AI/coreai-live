import { useState, useRef, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Wand2, Download, RotateCcw, FlipHorizontal, FlipVertical, 
  Contrast, Sun, Palette, Sparkles, Loader2, X, Crop, Check
} from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface ImageEditorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  imageUrl: string;
  prompt: string;
}

export const ImageEditor = ({ open, onOpenChange, imageUrl, prompt }: ImageEditorProps) => {
  const [editedImage, setEditedImage] = useState(imageUrl);
  const [isProcessing, setIsProcessing] = useState(false);
  const [aiPrompt, setAiPrompt] = useState("");
  
  // Filters
  const [brightness, setBrightness] = useState(100);
  const [contrast, setContrast] = useState(100);
  const [saturation, setSaturation] = useState(100);
  const [rotation, setRotation] = useState(0);
  const [flipH, setFlipH] = useState(false);
  const [flipV, setFlipV] = useState(false);

  // Crop state
  const [isCropping, setIsCropping] = useState(false);
  const [cropStart, setCropStart] = useState({ x: 0, y: 0 });
  const [cropEnd, setCropEnd] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [aspectRatio, setAspectRatio] = useState<number | null>(null);
  const imageContainerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  const aspectRatioPresets = [
    { label: "Free", value: null },
    { label: "1:1", value: 1 },
    { label: "16:9", value: 16 / 9 },
    { label: "9:16", value: 9 / 16 },
    { label: "4:3", value: 4 / 3 },
  ];

  const resetFilters = () => {
    setBrightness(100);
    setContrast(100);
    setSaturation(100);
    setRotation(0);
    setFlipH(false);
    setFlipV(false);
    setEditedImage(imageUrl);
    setIsCropping(false);
    setCropStart({ x: 0, y: 0 });
    setCropEnd({ x: 0, y: 0 });
    setAspectRatio(null);
  };

  // Crop handlers
  const handleCropMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isCropping || !imageContainerRef.current) return;
    
    const rect = imageContainerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    setCropStart({ x, y });
    setCropEnd({ x, y });
    setIsDragging(true);
  };

  const handleCropMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDragging || !isCropping || !imageContainerRef.current) return;
    
    const rect = imageContainerRef.current.getBoundingClientRect();
    let x = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
    let y = Math.max(0, Math.min(e.clientY - rect.top, rect.height));
    
    // Apply aspect ratio constraint
    if (aspectRatio !== null) {
      const width = Math.abs(x - cropStart.x);
      const height = Math.abs(y - cropStart.y);
      
      // Calculate which dimension to constrain based on aspect ratio
      const currentRatio = width / height;
      
      if (currentRatio > aspectRatio) {
        // Width is too large, constrain it
        const newWidth = height * aspectRatio;
        x = cropStart.x + (x > cropStart.x ? newWidth : -newWidth);
      } else {
        // Height is too large, constrain it
        const newHeight = width / aspectRatio;
        y = cropStart.y + (y > cropStart.y ? newHeight : -newHeight);
      }
      
      // Clamp to container bounds
      x = Math.max(0, Math.min(x, rect.width));
      y = Math.max(0, Math.min(y, rect.height));
    }
    
    setCropEnd({ x, y });
  };

  const handleCropMouseUp = () => {
    setIsDragging(false);
  };

  const applyCrop = async () => {
    if (!imageRef.current || !imageContainerRef.current) return;

    const img = imageRef.current;
    const container = imageContainerRef.current;
    const containerRect = container.getBoundingClientRect();

    // Calculate scale between displayed image and actual image
    const scaleX = img.naturalWidth / img.width;
    const scaleY = img.naturalHeight / img.height;

    // Get crop bounds
    const cropX = Math.min(cropStart.x, cropEnd.x);
    const cropY = Math.min(cropStart.y, cropEnd.y);
    const cropWidth = Math.abs(cropEnd.x - cropStart.x);
    const cropHeight = Math.abs(cropEnd.y - cropStart.y);

    if (cropWidth < 10 || cropHeight < 10) {
      toast.error("Crop area too small");
      return;
    }

    // Calculate image offset within container
    const imgRect = img.getBoundingClientRect();
    const offsetX = imgRect.left - containerRect.left;
    const offsetY = imgRect.top - containerRect.top;

    // Adjust crop coordinates relative to image
    const adjustedX = (cropX - offsetX) * scaleX;
    const adjustedY = (cropY - offsetY) * scaleY;
    const adjustedWidth = cropWidth * scaleX;
    const adjustedHeight = cropHeight * scaleY;

    // Create canvas and crop
    const canvas = document.createElement('canvas');
    canvas.width = adjustedWidth;
    canvas.height = adjustedHeight;
    const ctx = canvas.getContext('2d');
    
    if (!ctx) {
      toast.error("Failed to create canvas");
      return;
    }

    // Load image and draw cropped region
    const tempImg = new Image();
    tempImg.crossOrigin = "anonymous";
    tempImg.src = editedImage;
    
    tempImg.onload = () => {
      ctx.drawImage(
        tempImg,
        Math.max(0, adjustedX),
        Math.max(0, adjustedY),
        Math.min(adjustedWidth, tempImg.width - adjustedX),
        Math.min(adjustedHeight, tempImg.height - adjustedY),
        0,
        0,
        canvas.width,
        canvas.height
      );
      
      const croppedUrl = canvas.toDataURL('image/png');
      setEditedImage(croppedUrl);
      setIsCropping(false);
      setCropStart({ x: 0, y: 0 });
      setCropEnd({ x: 0, y: 0 });
      toast.success("Image cropped!");
    };

    tempImg.onerror = () => {
      toast.error("Failed to load image for cropping");
    };
  };

  const getCropStyle = () => {
    const left = Math.min(cropStart.x, cropEnd.x);
    const top = Math.min(cropStart.y, cropEnd.y);
    const width = Math.abs(cropEnd.x - cropStart.x);
    const height = Math.abs(cropEnd.y - cropStart.y);
    
    return {
      left: `${left}px`,
      top: `${top}px`,
      width: `${width}px`,
      height: `${height}px`,
    };
  };

  const handleAIEdit = async () => {
    if (!aiPrompt.trim()) {
      toast.error("Please enter an editing instruction");
      return;
    }

    setIsProcessing(true);
    try {
      const { data, error } = await supabase.functions.invoke('image-edit', {
        body: { 
          imageUrl: editedImage,
          editPrompt: aiPrompt
        }
      });

      if (error) throw error;
      
      if (data?.editedImageUrl) {
        setEditedImage(data.editedImageUrl);
        toast.success("Image edited successfully!");
        setAiPrompt("");
      }
    } catch (error) {
      console.error("AI Edit error:", error);
      toast.error("Failed to edit image with AI");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = async () => {
    try {
      const response = await fetch(editedImage);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `edited-${prompt.slice(0, 20)}.png`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success("Image downloaded!");
    } catch (error) {
      console.error("Download error:", error);
      toast.error("Failed to download image");
    }
  };

  const getImageStyle = () => ({
    filter: `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturation}%)`,
    transform: `rotate(${rotation}deg) scaleX(${flipH ? -1 : 1}) scaleY(${flipV ? -1 : 1})`,
    transition: "all 0.3s ease"
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Wand2 className="w-5 h-5 text-primary" />
            Image Editor
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Image Preview */}
          <div 
            ref={imageContainerRef}
            className={`relative bg-muted rounded-lg overflow-hidden flex items-center justify-center min-h-[300px] ${isCropping ? 'cursor-crosshair' : ''}`}
            onMouseDown={handleCropMouseDown}
            onMouseMove={handleCropMouseMove}
            onMouseUp={handleCropMouseUp}
            onMouseLeave={handleCropMouseUp}
          >
            {isProcessing && (
              <div className="absolute inset-0 bg-background/80 flex items-center justify-center z-10">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            )}
            <img 
              ref={imageRef}
              src={editedImage} 
              alt={prompt}
              style={getImageStyle()}
              className="max-w-full max-h-[400px] object-contain select-none"
              draggable={false}
            />
            {/* Crop overlay */}
            {isCropping && (cropStart.x !== cropEnd.x || cropStart.y !== cropEnd.y) && (
              <>
                <div className="absolute inset-0 bg-black/50 pointer-events-none" />
                <div 
                  className="absolute border-2 border-primary bg-transparent pointer-events-none"
                  style={getCropStyle()}
                >
                  <div className="absolute inset-0 border border-dashed border-white/50" />
                </div>
              </>
            )}
          </div>

          {/* Controls */}
          <div className="space-y-4">
            <Tabs defaultValue="filters" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="filters">Filters</TabsTrigger>
                <TabsTrigger value="crop">Crop</TabsTrigger>
                <TabsTrigger value="ai">AI Edit</TabsTrigger>
              </TabsList>

              <TabsContent value="filters" className="space-y-4 mt-4">
                {/* Brightness */}
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Sun className="w-4 h-4" />
                    Brightness: {brightness}%
                  </Label>
                  <Slider
                    value={[brightness]}
                    onValueChange={(v) => setBrightness(v[0])}
                    min={0}
                    max={200}
                    step={1}
                  />
                </div>

                {/* Contrast */}
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Contrast className="w-4 h-4" />
                    Contrast: {contrast}%
                  </Label>
                  <Slider
                    value={[contrast]}
                    onValueChange={(v) => setContrast(v[0])}
                    min={0}
                    max={200}
                    step={1}
                  />
                </div>

                {/* Saturation */}
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Palette className="w-4 h-4" />
                    Saturation: {saturation}%
                  </Label>
                  <Slider
                    value={[saturation]}
                    onValueChange={(v) => setSaturation(v[0])}
                    min={0}
                    max={200}
                    step={1}
                  />
                </div>

                {/* Transform Controls */}
                <div className="flex flex-wrap gap-2 pt-4">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setRotation(r => (r - 90) % 360)}
                  >
                    <RotateCcw className="w-4 h-4 mr-1" />
                    Rotate Left
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setRotation(r => (r + 90) % 360)}
                  >
                    <RotateCcw className="w-4 h-4 mr-1 scale-x-[-1]" />
                    Rotate Right
                  </Button>
                  <Button 
                    variant={flipH ? "default" : "outline"}
                    size="sm"
                    onClick={() => setFlipH(!flipH)}
                  >
                    <FlipHorizontal className="w-4 h-4 mr-1" />
                    Flip H
                  </Button>
                  <Button 
                    variant={flipV ? "default" : "outline"}
                    size="sm"
                    onClick={() => setFlipV(!flipV)}
                  >
                    <FlipVertical className="w-4 h-4 mr-1" />
                    Flip V
                  </Button>
                </div>
              </TabsContent>

              <TabsContent value="crop" className="space-y-4 mt-4">
                <div className="space-y-3">
                  <Label className="flex items-center gap-2">
                    <Crop className="w-4 h-4" />
                    Crop Image
                  </Label>
                  
                  {/* Aspect Ratio Presets */}
                  <div className="space-y-2">
                    <Label className="text-xs text-muted-foreground">Aspect Ratio</Label>
                    <div className="flex flex-wrap gap-2">
                      {aspectRatioPresets.map((preset) => (
                        <Button
                          key={preset.label}
                          variant={aspectRatio === preset.value ? "default" : "outline"}
                          size="sm"
                          onClick={() => {
                            setAspectRatio(preset.value);
                            setCropStart({ x: 0, y: 0 });
                            setCropEnd({ x: 0, y: 0 });
                          }}
                        >
                          {preset.label}
                        </Button>
                      ))}
                    </div>
                  </div>
                  
                  <p className="text-sm text-muted-foreground">
                    {isCropping 
                      ? "Click and drag on the image to select the area you want to keep."
                      : "Click 'Start Cropping' and then drag on the image to select the crop area."
                    }
                  </p>
                  
                  {!isCropping ? (
                    <Button 
                      onClick={() => setIsCropping(true)}
                      variant="outline"
                      className="w-full"
                    >
                      <Crop className="w-4 h-4 mr-2" />
                      Start Cropping
                    </Button>
                  ) : (
                    <div className="flex gap-2">
                      <Button 
                        variant="outline"
                        onClick={() => {
                          setIsCropping(false);
                          setCropStart({ x: 0, y: 0 });
                          setCropEnd({ x: 0, y: 0 });
                        }}
                        className="flex-1"
                      >
                        <X className="w-4 h-4 mr-2" />
                        Cancel
                      </Button>
                      <Button 
                        onClick={applyCrop}
                        disabled={Math.abs(cropEnd.x - cropStart.x) < 10 || Math.abs(cropEnd.y - cropStart.y) < 10}
                        className="flex-1"
                      >
                        <Check className="w-4 h-4 mr-2" />
                        Apply Crop
                      </Button>
                    </div>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="ai" className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4" />
                    AI Editing Instruction
                  </Label>
                  <Input
                    placeholder="e.g., Make it look like sunset, Add snow effect..."
                    value={aiPrompt}
                    onChange={(e) => setAiPrompt(e.target.value)}
                    disabled={isProcessing}
                  />
                  <p className="text-xs text-muted-foreground">
                    Describe how you want to edit this image using AI
                  </p>
                </div>
                <Button 
                  onClick={handleAIEdit} 
                  disabled={isProcessing || !aiPrompt.trim()}
                  className="w-full"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Wand2 className="w-4 h-4 mr-2" />
                      Apply AI Edit
                    </>
                  )}
                </Button>
              </TabsContent>
            </Tabs>

            {/* Action Buttons */}
            <div className="flex gap-2 pt-4 border-t border-border">
              <Button variant="outline" onClick={resetFilters} className="flex-1">
                <X className="w-4 h-4 mr-2" />
                Reset
              </Button>
              <Button onClick={handleDownload} className="flex-1">
                <Download className="w-4 h-4 mr-2" />
                Download
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
