import { MarkdownRenderer } from './MarkdownRenderer';
import { MessageActions } from './MessageActions';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import coreaiLogo from '@/assets/coreai-logo.png';
import { useState } from 'react';
import { FullScreenImageViewer } from './FullScreenImageViewer';
import { File as FileIcon, X } from 'lucide-react';

interface ChatMessageProps {
  message: string;
  messageId?: string;
  isUser: boolean;
  timestamp?: string;
  images?: any[];
  isGeneratingImage?: boolean;
  onRegenerate?: () => void;
  onEdit?: () => void;
}

export const ChatMessage = ({ 
  message, 
  messageId,
  isUser, 
  timestamp, 
  images, 
  isGeneratingImage,
  onRegenerate,
  onEdit
}: ChatMessageProps) => {
  const [fullScreenImage, setFullScreenImage] = useState<string | null>(null);

  // Helper to render images/files at top of message (ChatGPT style)
  const renderAttachments = () => {
    if (!images || images.length === 0) return null;
    
    return (
      <div className="mb-2 space-y-2">
        {images.map((image: any, index: number) => {
          const imageUrl = image.image_url?.url || image.url;
          const isImage = image.type?.startsWith('image/') || imageUrl?.startsWith('data:image') || imageUrl?.includes('image');
          
          if (isImage && imageUrl) {
            return (
              <motion.div 
                key={index} 
                className="rounded-lg overflow-hidden shadow-sm cursor-pointer group/image relative"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                onClick={() => setFullScreenImage(imageUrl)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <img
                  src={imageUrl}
                  alt={`Attachment ${index + 1}`}
                  className="w-full h-auto max-w-xs rounded-lg transition-all duration-300"
                  loading="lazy"
                  onError={(e) => {
                    console.error('Error loading image:', e);
                    e.currentTarget.style.display = 'none';
                  }}
                />
                {/* Hover overlay */}
                <div className="absolute inset-0 bg-black/0 group-hover/image:bg-black/20 transition-colors duration-200 flex items-center justify-center">
                  <span className="text-white text-xs font-medium opacity-0 group-hover/image:opacity-100 transition-opacity duration-200 bg-black/50 px-2 py-1 rounded-full">
                    View
                  </span>
                </div>
              </motion.div>
            );
          } else {
            // File attachment
            return (
              <div key={index} className="flex items-center gap-2 p-2 bg-muted/50 rounded-lg">
                <FileIcon className="w-4 h-4 text-muted-foreground" />
                <span className="text-xs text-muted-foreground truncate">
                  {image.name || 'Attached file'}
                </span>
              </div>
            );
          }
        })}
      </div>
    );
  };

  if (isUser) {
    return (
      <motion.div 
        className="flex justify-end mb-3 group"
        initial={{ opacity: 0, y: 10, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.2, ease: "easeOut" }}
      >
        {/* Mobile: 88%, Tablet: 80%, Desktop: 70% - prevents paragraph walls */}
        <div className="flex items-end gap-2 max-w-[88%] sm:max-w-[80%] lg:max-w-[70%]">
          {/* Actions on hover */}
          <MessageActions 
            message={message} 
            messageId={messageId}
            isUser={true} 
            onEdit={onEdit}
            className="mb-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
          />
          
          <div className="relative min-w-0 flex-1">
            <motion.div 
              className="bg-primary text-primary-foreground rounded-2xl rounded-br-md px-3 py-2 shadow-sm"
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.15, delay: 0.05 }}
            >
              {/* ChatGPT-style: Images/files first, then text */}
              {renderAttachments()}
              
              {/* Text message - Normal whitespace with proper line-height */}
              {message && (
                <p className="text-sm leading-relaxed break-words whitespace-normal [overflow-wrap:anywhere]">{message}</p>
              )}
              
              {timestamp && (
                <p className="text-[10px] opacity-70 mt-1">{timestamp}</p>
              )}
            </motion.div>
          </div>
          
          {/* User avatar with logo */}
          <motion.div 
            className="flex items-end shrink-0"
            initial={{ scale: 0, rotate: -30 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ duration: 0.2, delay: 0.1 }}
          >
            <div className="w-7 h-7 gradient-bg rounded-full flex items-center justify-center text-white text-xs font-bold shadow-sm ring-1 ring-background">
              U
            </div>
          </motion.div>
        </div>
        
        {/* Full screen image viewer */}
        <FullScreenImageViewer
          isOpen={!!fullScreenImage}
          imageUrl={fullScreenImage || ''}
          onClose={() => setFullScreenImage(null)}
          prompt={message}
        />
      </motion.div>
    );
  }

  return (
    <motion.div 
      className="flex mb-3 group"
      initial={{ opacity: 0, y: 10, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
    >
      {/* AI avatar with CoreAI logo */}
      <motion.div 
        className="mr-2 flex items-start shrink-0"
        initial={{ scale: 0, rotate: 30 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ duration: 0.2, delay: 0.05 }}
      >
        <img 
          src={coreaiLogo} 
          alt="CoreAI" 
          className="w-7 h-7 rounded-full shadow-sm ring-1 ring-background" 
        />
      </motion.div>
      
      {/* Mobile: 88%, Tablet: 80%, Desktop: 75% - readable line-by-line */}
      <div className="flex-1 min-w-0 max-w-[88%] sm:max-w-[80%] lg:max-w-[75%]">
        <motion.div 
          className="bg-card text-card-foreground rounded-2xl rounded-tl-md px-3 py-2 shadow-sm border border-border/50"
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.15, delay: 0.1 }}
        >
          {/* Display images if present - ChatGPT style at top */}
          {images && images.length > 0 && (
            <div className="mb-3 space-y-2">
              {images.map((image: any, index: number) => {
                const imageUrl = image.image_url?.url || image.url;
                return (
                  <motion.div 
                    key={index} 
                    className="rounded-lg overflow-hidden shadow-sm cursor-pointer group/image relative"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3, delay: 0.15 + index * 0.05 }}
                    onClick={() => setFullScreenImage(imageUrl)}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <img
                      src={imageUrl}
                      alt={`Generated image ${index + 1}`}
                      className="w-full h-auto max-w-sm rounded-lg transition-all duration-300"
                      loading="lazy"
                      onError={(e) => {
                        console.error('Error loading image:', e);
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                    {/* Hover overlay */}
                    <div className="absolute inset-0 bg-black/0 group-hover/image:bg-black/20 transition-colors duration-200 flex items-center justify-center">
                      <span className="text-white text-sm font-medium opacity-0 group-hover/image:opacity-100 transition-opacity duration-200 bg-black/50 px-3 py-1 rounded-full">
                        View Full Screen
                      </span>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
          
          {/* Display text content */}
          {message && (
            <motion.div 
              className="text-sm leading-snug"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.2, delay: 0.15 }}
            >
              <MarkdownRenderer content={message} className="break-words [overflow-wrap:anywhere]" />
            </motion.div>
          )}
          
          {timestamp && (
            <p className="text-[10px] text-muted-foreground mt-2">{timestamp}</p>
          )}
        </motion.div>
        
        {/* Actions below message for AI */}
        {message && (
          <MessageActions 
            message={message} 
            messageId={messageId}
            isUser={false} 
            onRegenerate={onRegenerate}
            className="mt-1 ml-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
          />
        )}
      </div>
      
      {/* Full screen image viewer */}
      <FullScreenImageViewer
        isOpen={!!fullScreenImage}
        imageUrl={fullScreenImage || ''}
        onClose={() => setFullScreenImage(null)}
        prompt={message}
      />
    </motion.div>
  );
};