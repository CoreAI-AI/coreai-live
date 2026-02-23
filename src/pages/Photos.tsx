import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ArrowLeft, Download, Trash2, Copy, Wand2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { ImageEditor } from "@/components/ImageEditor";

interface GeneratedImage {
  id: string;
  image_url: string;
  prompt: string;
  created_at: string;
}

const Photos = () => {
  const {
    user,
    loading: authLoading
  } = useAuth();
  const navigate = useNavigate();
  const [images, setImages] = useState<GeneratedImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [editingImage, setEditingImage] = useState<GeneratedImage | null>(null);

  // Redirect if not authenticated
  if (!authLoading && !user) {
    navigate("/");
    return null;
  }
  useEffect(() => {
    if (user) {
      loadImages();
    }
  }, [user]);

  // Real-time subscription for new images
  useEffect(() => {
    if (!user) return;
    const channel = supabase.channel('generated_images_changes').on('postgres_changes', {
      event: 'INSERT',
      schema: 'public',
      table: 'generated_images',
      filter: `user_id=eq.${user.id}`
    }, payload => {
      console.log('New image generated:', payload);
      setImages(prev => [payload.new as GeneratedImage, ...prev]);
      toast.success("New image generated!");
    }).subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);
  const loadImages = async () => {
    try {
      setLoading(true);
      const {
        data,
        error
      } = await supabase.from("generated_images").select("*").order("created_at", {
        ascending: false
      });
      if (error) throw error;
      setImages(data || []);
    } catch (error) {
      console.error("Error loading images:", error);
      toast.error("Failed to load images");
    } finally {
      setLoading(false);
    }
  };
  const handleDownload = async (imageUrl: string, prompt: string) => {
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${prompt.slice(0, 30)}.png`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success("Image downloaded");
    } catch (error) {
      console.error("Error downloading image:", error);
      toast.error("Failed to download image");
    }
  };
  const handleCopyLink = async (imageUrl: string) => {
    try {
      await navigator.clipboard.writeText(imageUrl);
      toast.success("Image link copied to clipboard");
    } catch (error) {
      console.error("Error copying link:", error);
      toast.error("Failed to copy link");
    }
  };
  const handleShare = async (imageUrl: string, prompt: string) => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: 'CoreAI Generated Image',
          text: prompt,
          url: imageUrl
        });
      } else {
        // Fallback to copy link
        await handleCopyLink(imageUrl);
        toast.success("Link copied (sharing not supported on this device)");
      }
    } catch (error) {
      console.error("Error sharing:", error);
      if (error instanceof Error && error.name !== 'AbortError') {
        toast.error("Failed to share image");
      }
    }
  };
  const handleDelete = async (id: string) => {
    try {
      const {
        error
      } = await supabase.from("generated_images").delete().eq("id", id);
      if (error) throw error;
      setImages(images.filter(img => img.id !== id));
      toast.success("Image deleted");
    } catch (error) {
      console.error("Error deleting image:", error);
      toast.error("Failed to delete image");
    } finally {
      setDeleteId(null);
    }
  };
  return <div className="flex flex-col h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border p-4 flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => navigate("/")} className="flex items-center gap-2">
          <ArrowLeft className="w-4 h-4" />
          Back
        </Button>
        <h1 className="text-2xl font-semibold text-foreground">Image Studio</h1>
      </div>

      {/* Content */}
      <ScrollArea className="flex-1">
        <div className="p-6">
          {loading ? <div className="flex items-center justify-center min-h-[60vh]">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                <div className="text-muted-foreground">Loading images...</div>
              </div>
            </div> : images.length === 0 ? <div className="flex items-center justify-center min-h-[60vh]">
              <div className="text-center">
                <h2 className="text-xl font-semibold mb-2">No images yet</h2>
                <p className="text-muted-foreground">
                  Generate images using the chat to see them here
                </p>
              </div>
            </div> : <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {images.map(image => <div key={image.id} className="bg-card rounded-lg border border-border overflow-hidden group hover:shadow-lg transition-shadow">
                  <div className="aspect-square relative">
                    <img src={image.image_url} alt={image.prompt} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <Button variant="secondary" size="sm" onClick={() => setEditingImage(image)} className="flex items-center gap-1" title="Edit">
                        <Wand2 className="w-4 h-4" />
                      </Button>
                      <Button variant="secondary" size="sm" onClick={() => handleDownload(image.image_url, image.prompt)} className="flex items-center gap-1" title="Download">
                        <Download className="w-4 h-4" />
                      </Button>
                      <Button variant="secondary" size="sm" onClick={() => handleCopyLink(image.image_url)} className="flex items-center gap-1" title="Copy Link">
                        <Copy className="w-4 h-4" />
                      </Button>
                      <Button variant="destructive" size="sm" onClick={() => setDeleteId(image.id)} className="flex items-center gap-1" title="Delete">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="p-3">
                    <p className="text-sm text-foreground line-clamp-2 mb-2">
                      {image.prompt}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(image.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>)}
            </div>}

          {/* Features Section - Premium AI Models - HIDDEN */}
        </div>
      </ScrollArea>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Image</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this image? This action cannot be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => deleteId && handleDelete(deleteId)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Image Editor Dialog */}
      {editingImage && (
        <ImageEditor
          open={!!editingImage}
          onOpenChange={(open) => !open && setEditingImage(null)}
          imageUrl={editingImage.image_url}
          prompt={editingImage.prompt}
        />
      )}
    </div>;
};
export default Photos;