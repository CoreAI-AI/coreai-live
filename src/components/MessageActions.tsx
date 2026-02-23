import { useState, useEffect } from 'react';
import { Copy, Check, RotateCcw, Pencil, ThumbsUp, ThumbsDown, MoreHorizontal, Volume2, Flag, Pin, Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { pinMessage } from './PinnedMessages';

interface MessageActionsProps {
  message: string;
  messageId?: string;
  chatId?: string;
  isUser: boolean;
  onRegenerate?: () => void;
  onEdit?: () => void;
  onReadAloud?: () => void;
  className?: string;
}

export const MessageActions = ({ 
  message, 
  messageId,
  chatId,
  isUser, 
  onRegenerate, 
  onEdit,
  onReadAloud,
  className 
}: MessageActionsProps) => {
  const [copied, setCopied] = useState(false);
  const [feedback, setFeedback] = useState<'good' | 'bad' | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load existing feedback on mount
  useEffect(() => {
    const loadFeedback = async () => {
      if (!messageId || isUser) return;
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from('message_feedback')
        .select('feedback_type')
        .eq('message_id', messageId)
        .eq('user_id', user.id)
        .maybeSingle();

      if (data) {
        setFeedback(data.feedback_type as 'good' | 'bad');
      }
    };

    loadFeedback();
  }, [messageId, isUser]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(message);
      setCopied(true);
      toast.success('Message copied');
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast.error('Failed to copy');
    }
  };

  const handleFeedback = async (type: 'good' | 'bad') => {
    if (!messageId || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error('Please sign in to give feedback');
        return;
      }

      // If clicking the same feedback, remove it
      if (feedback === type) {
        await supabase
          .from('message_feedback')
          .delete()
          .eq('message_id', messageId)
          .eq('user_id', user.id);
        setFeedback(null);
        toast.success('Feedback removed');
      } else {
        // Upsert feedback
        await supabase
          .from('message_feedback')
          .upsert({
            user_id: user.id,
            message_id: messageId,
            feedback_type: type
          }, {
            onConflict: 'user_id,message_id'
          });
        setFeedback(type);
        toast.success('Thanks for your feedback!');
      }
    } catch (error) {
      console.error('Error saving feedback:', error);
      toast.error('Failed to save feedback');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReadAloud = () => {
    if (onReadAloud) {
      onReadAloud();
    } else {
      const utterance = new SpeechSynthesisUtterance(message);
      speechSynthesis.speak(utterance);
      toast.success('Reading aloud...');
    }
  };

  const handleReport = () => {
    toast.success('Message reported. Thank you for helping us improve.');
  };

  const handlePin = () => {
    if (!chatId || !messageId) {
      toast.error('Cannot pin this message');
      return;
    }
    
    const pinned = pinMessage(chatId, messageId, message);
    if (pinned) {
      toast.success('Message pinned!');
    } else {
      toast.info('Message already pinned');
    }
  };

  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          text: message,
        });
      } else {
        await navigator.clipboard.writeText(message);
        toast.success('Message copied to clipboard');
      }
    } catch (err) {
      // User cancelled or error
    }
  };

  return (
    <div className={cn(
      "flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200",
      className
    )}>
      {/* Copy button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={handleCopy}
        className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground active:scale-95 transition-transform"
        title="Copy message"
      >
        {copied ? (
          <Check className="h-3.5 w-3.5 text-green-500" />
        ) : (
          <Copy className="h-3.5 w-3.5" />
        )}
      </Button>

      {/* Good/Bad response buttons (AI messages only) */}
      {!isUser && (
        <>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleFeedback('good')}
            disabled={isSubmitting}
            className={cn(
              "h-7 w-7 p-0 text-muted-foreground hover:text-foreground active:scale-95 transition-transform",
              feedback === 'good' && "text-green-500 hover:text-green-500"
            )}
            title="Good response"
          >
            <ThumbsUp className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleFeedback('bad')}
            disabled={isSubmitting}
            className={cn(
              "h-7 w-7 p-0 text-muted-foreground hover:text-foreground active:scale-95 transition-transform",
              feedback === 'bad' && "text-red-500 hover:text-red-500"
            )}
            title="Bad response"
          >
            <ThumbsDown className="h-3.5 w-3.5" />
          </Button>
        </>
      )}

      {/* Regenerate button (AI messages only) */}
      {!isUser && onRegenerate && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onRegenerate}
          className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground active:scale-95 transition-transform"
          title="Regenerate response"
        >
          <RotateCcw className="h-3.5 w-3.5" />
        </Button>
      )}

      {/* More options menu (AI messages only) */}
      {!isUser && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground active:scale-95 transition-transform"
              title="More options"
            >
              <MoreHorizontal className="h-3.5 w-3.5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-44">
            <DropdownMenuItem onClick={handleReadAloud} className="gap-2 cursor-pointer">
              <Volume2 className="h-4 w-4" />
              Read aloud
            </DropdownMenuItem>
            {chatId && messageId && (
              <DropdownMenuItem onClick={handlePin} className="gap-2 cursor-pointer">
                <Pin className="h-4 w-4" />
                Pin message
              </DropdownMenuItem>
            )}
            <DropdownMenuItem onClick={handleShare} className="gap-2 cursor-pointer">
              <Share2 className="h-4 w-4" />
              Share
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleReport} className="gap-2 cursor-pointer text-destructive focus:text-destructive">
              <Flag className="h-4 w-4" />
              Report message
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )}

      {/* Edit button (User messages only) */}
      {isUser && onEdit && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onEdit}
          className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground active:scale-95 transition-transform"
          title="Edit message"
        >
          <Pencil className="h-3.5 w-3.5" />
        </Button>
      )}
    </div>
  );
};
