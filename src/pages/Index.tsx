import { useState, useEffect, useRef, useCallback, memo } from "react";
import { ChatSidebar } from "@/components/ChatSidebar";
import { ChatInput } from "@/components/ChatInput";
import { Auth } from "@/components/Auth";
import { Settings } from "@/components/Settings";
import { QuickActionCards } from "@/components/QuickActionCards";
import { ScrollToBottom } from "@/components/ScrollToBottom";
import { SplashScreen } from "@/components/SplashScreen";
import { PageSkeleton } from "@/components/SkeletonLoader";
import { ImageGeneratingOverlay } from "@/components/ImageGeneratingOverlay";
import { VirtualizedChatMessages } from "@/components/VirtualizedChatMessages";
import { SmartChatTabs } from "@/components/SmartChatTabs";
import { PinnedMessages } from "@/components/PinnedMessages";
import { QuickActionButtons } from "@/components/QuickActionButtons";
import { FloatingActionButton } from "@/components/FloatingActionButton";
import { MemoryControl } from "@/components/MemoryControl";
import { ChatSearch } from "@/components/ChatSearch";
import { ResponseLengthControl } from "@/components/ResponseLengthControl";
import { useAuth } from "@/hooks/useAuth";
import { useChats, Chat } from "@/hooks/useChats";
import { useSettings } from "@/hooks/useSettings";
import { useOfflineDraft } from "@/hooks/useOfflineDraft";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { X, PanelLeft, Users, Timer, ImageIcon, Search, Star } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { exportChatAsText, exportChatAsPDF } from "@/lib/exportChat";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";

const Index = () => {
  const navigate = useNavigate();
  const {
    user,
    loading: authLoading,
    showAuth,
    signOut,
    setShowAuth
  } = useAuth();
  const {
    settings
  } = useSettings(user?.id);
  const {
    chats,
    currentChat,
    messages,
    createChat,
    addMessage,
    updateMessage,
    deleteMessage,
    startNewChat,
    selectChat,
    deleteChat
  } = useChats(user?.id);
  const { saveDraft, removeDraft, isOnline } = useOfflineDraft();
  
  const [selectedModel, setSelectedModel] = useState("google/gemini-2.5-flash");
  const [isLoading, setIsLoading] = useState(false);
  const [isAITyping, setIsAITyping] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [chatMode, setChatMode] = useState<'normal' | 'deep-search' | 'study' | 'photo' | 'code' | 'creative' | 'analyze' | 'rich' | 'poor'>('normal');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => window.innerWidth < 768);
  const [temporaryMessages, setTemporaryMessages] = useState(false);
  const [showQuickActions, setShowQuickActions] = useState(true);
  const [showSplash, setShowSplash] = useState(true);
  const [hasNewMessage, setHasNewMessage] = useState(false);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [imageGenerationPrompt, setImageGenerationPrompt] = useState<string>("");
  const [isUserTyping, setIsUserTyping] = useState(false);
  
  // New feature states
  const [openTabs, setOpenTabs] = useState<Chat[]>([]);
  const [showSearch, setShowSearch] = useState(false);
  const [responseLength, setResponseLength] = useState<'short' | 'normal' | 'detailed'>('normal');
  const [favoriteChats, setFavoriteChats] = useState<Set<string>>(() => {
    const saved = localStorage.getItem('favorite_chats');
    return saved ? new Set(JSON.parse(saved)) : new Set();
  });
  
  const [editingMessage, setEditingMessage] = useState<{
    id: string;
    content: string;
    index: number;
  } | null>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const prevMessageCountRef = useRef(messages.length);

  // Check if user is near bottom of scroll (native div, not Radix ScrollArea)
  const isNearBottom = useCallback(() => {
    const container = scrollAreaRef.current;
    if (!container) return true;
    const {
      scrollTop,
      scrollHeight,
      clientHeight
    } = container;
    return scrollHeight - scrollTop - clientHeight < 100;
  }, []);

  // Track new messages when not at bottom
  useEffect(() => {
    if (messages.length > prevMessageCountRef.current && !isNearBottom()) {
      const lastMessage = messages[messages.length - 1];
      if (lastMessage && !lastMessage.is_user) {
        setHasNewMessage(true);
      }
    }
    prevMessageCountRef.current = messages.length;
  }, [messages, isNearBottom]);

  // Auto-scroll to bottom when messages or typing indicator changes (native div)
  useEffect(() => {
    const container = scrollAreaRef.current;
    if (container && isNearBottom()) {
      requestAnimationFrame(() => {
        container.scrollTop = container.scrollHeight;
      });
    }
  }, [messages, isAITyping, isNearBottom]);

  // Keyboard shortcuts: Ctrl+B sidebar, Ctrl+F search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'b') {
        e.preventDefault();
        setSidebarCollapsed(prev => !prev);
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'f' && messages.length > 0) {
        e.preventDefault();
        setShowSearch(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [messages.length]);

  // Manage open tabs for Smart Chat Tabs feature
  useEffect(() => {
    if (currentChat && !openTabs.find(t => t.id === currentChat.id)) {
      setOpenTabs(prev => [...prev, currentChat].slice(-5)); // Keep max 5 tabs
    }
  }, [currentChat]);

  const handleCloseTab = (chatId: string) => {
    setOpenTabs(prev => prev.filter(t => t.id !== chatId));
    if (currentChat?.id === chatId && openTabs.length > 1) {
      const remainingTabs = openTabs.filter(t => t.id !== chatId);
      if (remainingTabs.length > 0) {
        selectChat(remainingTabs[remainingTabs.length - 1]);
      }
    }
  };

  // Toggle favorite chat
  const toggleFavorite = (chatId: string) => {
    setFavoriteChats(prev => {
      const next = new Set(prev);
      if (next.has(chatId)) {
        next.delete(chatId);
      } else {
        next.add(chatId);
      }
      localStorage.setItem('favorite_chats', JSON.stringify([...next]));
      return next;
    });
  };

  // Scroll to message (for search and pinned)
  const scrollToMessage = (messageId: string) => {
    const element = document.getElementById(`message-${messageId}`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      element.classList.add('bg-primary/10');
      setTimeout(() => element.classList.remove('bg-primary/10'), 2000);
    }
  };

  // Quick action handlers
  const handleQuickAction = async (action: string) => {
    if (!currentChat || messages.length === 0) return;
    
    const lastAIMessage = [...messages].reverse().find(m => !m.is_user);
    if (!lastAIMessage) return;
    
    const actionPrompts: Record<string, string> = {
      rewrite: `Please rewrite the following response in a different way: "${lastAIMessage.content}"`,
      summarize: `Please summarize this response briefly: "${lastAIMessage.content}"`,
      translate: `Please translate this response to Hindi: "${lastAIMessage.content}"`,
      improve: `Please improve this response with more details: "${lastAIMessage.content}"`,
    };
    
    if (action === 'regenerate') {
      const aiMsgIndex = messages.findIndex(m => m.id === lastAIMessage.id);
      if (aiMsgIndex > 0) {
        handleRegenerateResponse(lastAIMessage.id, aiMsgIndex);
      }
    } else if (actionPrompts[action]) {
      handleSendMessage(actionPrompts[action]);
    }
  };

  // Show splash screen on initial load
  if (showSplash) {
    return <SplashScreen onComplete={() => setShowSplash(false)} />;
  }

  // If loading, show skeleton
  if (authLoading) {
    return <PageSkeleton />;
  }

  // Show auth page only if user has logged out or there's an auth error
  if (showAuth) {
    return <Auth onAuthSuccess={() => setShowAuth(false)} />;
  }

  // If no user, show auth page
  if (!user) {
    return <Auth onAuthSuccess={() => setShowAuth(false)} />;
  }
  const handleFileSelect = async (file: File) => {
    setSelectedFile(file);

    // Create preview for images
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFilePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setFilePreview(null);
    }
    toast.success(`File selected: ${file.name}`);
  };

  // Handle editing a user message
  const handleEditMessage = (messageId: string, content: string, index: number) => {
    setEditingMessage({
      id: messageId,
      content,
      index
    });
  };

  // Handle sending edited message (deletes AI response after it and regenerates)
  const handleSendEditedMessage = async (content: string) => {
    if (!user || !editingMessage || !currentChat) return;

    // Find the index of the message being edited
    const editIndex = editingMessage.index;

    // Get all messages after the edited message (including AI responses)
    const messagesToDelete = messages.slice(editIndex + 1);

    // Delete messages after the edited one
    for (const msg of messagesToDelete) {
      await deleteMessage(msg.id);
    }

    // Update the edited message content
    await updateMessage(editingMessage.id, content);

    // Clear editing state
    setEditingMessage(null);

    // Now regenerate the AI response
    setIsLoading(true);
    setIsAITyping(true);
    try {
      // Create AI message placeholder
      const aiMessage = await addMessage(currentChat.id, "", false);
      if (!aiMessage) return;
      const {
        data: session
      } = await supabase.auth.getSession();
      const authToken = session?.session?.access_token;

      // Get updated messages (after deletion)
      const updatedMessages = messages.slice(0, editIndex + 1).map(msg => msg.id === editingMessage.id ? {
        ...msg,
        content
      } : msg);
      const conversationHistory = updatedMessages.slice(-20).map(msg => ({
        role: msg.is_user ? 'user' : 'assistant',
        content: msg.id === editingMessage.id ? content : msg.content,
        ...(msg.images && msg.images.length > 0 ? {
          images: msg.images
        } : {})
      }));
      const modelToUse = chatMode === 'photo' ? 'google/gemini-2.5-flash-image-preview' : selectedModel;
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken || import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          'apikey': import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY
        },
        body: JSON.stringify({
          message: content,
          model: modelToUse,
          mode: chatMode,
          conversationHistory: conversationHistory
        })
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      if (!reader) {
        throw new Error("No response body");
      }
      let accumulatedContent = "";
      let receivedImages: any[] = [];
      let buffer = "";
      setIsAITyping(false);
      while (true) {
        const {
          done,
          value
        } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, {
          stream: true
        });
        const lines = buffer.split('\n');
        buffer = lines.pop() || "";
        for (const line of lines) {
          if (!line.trim() || !line.startsWith('data: ')) continue;
          const data = line.slice(6);
          if (data === '[DONE]') break;
          try {
            const parsed = JSON.parse(data);
            if (parsed.content) {
              accumulatedContent += parsed.content;
              await updateMessage(aiMessage.id, accumulatedContent);
            }
            if (parsed.images?.length > 0) {
              receivedImages = parsed.images;
              await updateMessage(aiMessage.id, accumulatedContent, parsed.images);
            }
          } catch {}
        }
      }
      if (receivedImages.length > 0) {
        await updateMessage(aiMessage.id, accumulatedContent, receivedImages);
      }
    } catch (error) {
      console.error('Error regenerating AI response:', error);
      toast.error("Failed to regenerate response. Please try again.");
    } finally {
      setIsLoading(false);
      setIsAITyping(false);
    }
  };

  // Handle regenerating the last AI response
  const handleRegenerateResponse = async (aiMessageId: string, aiMessageIndex: number) => {
    if (!user || !currentChat || isLoading) return;

    // Find the user message before this AI message
    const userMessageIndex = aiMessageIndex - 1;
    if (userMessageIndex < 0) return;
    const userMessage = messages[userMessageIndex];
    if (!userMessage || !userMessage.is_user) return;
    setIsLoading(true);
    setIsAITyping(true);
    try {
      // Clear the AI message content first
      await updateMessage(aiMessageId, "");
      const {
        data: session
      } = await supabase.auth.getSession();
      const authToken = session?.session?.access_token;

      // Get conversation history up to (but not including) the AI message being regenerated
      const conversationHistory = messages.slice(0, aiMessageIndex).slice(-20).map(msg => ({
        role: msg.is_user ? 'user' : 'assistant',
        content: msg.content,
        ...(msg.images && msg.images.length > 0 ? {
          images: msg.images
        } : {})
      }));
      const modelToUse = chatMode === 'photo' ? 'google/gemini-2.5-flash-image-preview' : selectedModel;
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken || import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          'apikey': import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY
        },
        body: JSON.stringify({
          message: userMessage.content,
          model: modelToUse,
          mode: chatMode,
          conversationHistory: conversationHistory
        })
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      if (!reader) {
        throw new Error("No response body");
      }
      let accumulatedContent = "";
      let receivedImages: any[] = [];
      let buffer = "";
      setIsAITyping(false);
      while (true) {
        const {
          done,
          value
        } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, {
          stream: true
        });
        const lines = buffer.split('\n');
        buffer = lines.pop() || "";
        for (const line of lines) {
          if (!line.trim() || !line.startsWith('data: ')) continue;
          const data = line.slice(6);
          if (data === '[DONE]') break;
          try {
            const parsed = JSON.parse(data);
            if (parsed.content) {
              accumulatedContent += parsed.content;
              await updateMessage(aiMessageId, accumulatedContent);
            }
            if (parsed.images?.length > 0) {
              receivedImages = parsed.images;
              await updateMessage(aiMessageId, accumulatedContent, parsed.images);
            }
          } catch {}
        }
      }
      if (receivedImages.length > 0) {
        await updateMessage(aiMessageId, accumulatedContent, receivedImages);
      }
      toast.success("Response regenerated");
    } catch (error) {
      console.error('Error regenerating response:', error);
      toast.error("Failed to regenerate response");
    } finally {
      setIsLoading(false);
      setIsAITyping(false);
    }
  };
  const handleSendMessage = async (content: string) => {
    // If we're editing, handle differently
    if (editingMessage) {
      await handleSendEditedMessage(content);
      return;
    }
    if (!user) return;
    let chatToUse = currentChat;

    // Create a new chat if none exists
    if (!chatToUse) {
      const chatTitle = content.length > 50 ? content.substring(0, 47) + "..." : content;
      chatToUse = await createChat(chatTitle);
      if (!chatToUse) return;
    }

    // Prepare images array if file is selected
    const messageImages = selectedFile && filePreview ? [{
      url: filePreview,
      type: selectedFile.type
    }] : undefined;

    // Add user message to database with images
    const userMessage = await addMessage(chatToUse.id, content, true, messageImages);
    if (!userMessage) return;
    setIsLoading(true);
    setIsAITyping(true);
    try {
      // Create AI message placeholder
      const aiMessage = await addMessage(chatToUse.id, "", false);
      if (!aiMessage) return;
      const {
        data: session
      } = await supabase.auth.getSession();
      const authToken = session?.session?.access_token;

      // Prepare text content for non-image files
      let fileTextToSend: string | undefined;
      let fileNameToSend: string | undefined;
      if (selectedFile && !selectedFile.type.startsWith('image/')) {
        try {
          const txt = await selectedFile.text();
          fileTextToSend = txt.slice(0, 12000); // limit to avoid huge payloads
          fileNameToSend = selectedFile.name;
        } catch (e) {
          console.warn('Failed to read file as text:', e);
        }
      }

      // Limit conversation history to last 20 messages for better performance
      const recentMessages = messages.slice(-20);
      const conversationHistory = recentMessages.map(msg => {
        const historyItem: any = {
          role: msg.is_user ? 'user' : 'assistant',
          content: msg.content
        };

        // Include images from previous messages
        if (msg.images && msg.images.length > 0) {
          historyItem.images = msg.images;
        }
        return historyItem;
      });

      // Detect if this is an image generation request
      const lower = content.toLowerCase();
      const genKeywords = [
        'generate image', 'create image', 'make an image', 'make image', 'draw', 'generate a photo', 'create a photo', 'generate picture', 'create picture',
        'photo banao', 'photo bana do', 'photo bana de', 'image banao', 'tasveer banao', 'tasvir banao', 'chitra banao', 'tasveer bana do',
        'फोटो', 'चित्र', 'तस्वीर', 'बनाओ', 'बनाइए', 'बनाना',
        'restore', 'restore photo', 'restore image', 'fix photo', 'enhance photo', 'old photo', 'purani photo', 'पुरानी फोटो'
      ];
      const hasMediaWord = ['image','photo','picture','tasveer','tasvir','chitra','फोटो','चित्र','तस्वीर'].some(w => lower.includes(w));
      const hasMakeWord = ['generate','create','make','banao','bana do','bana de','banaye','bnana','bna','बनाओ','बनाइए','बनाना','restore','fix','enhance'].some(w => lower.includes(w));
      const wantsImageGeneration = chatMode === 'photo' || (genKeywords.some(k => lower.includes(k)) || (hasMediaWord && hasMakeWord));
      
      if (wantsImageGeneration) {
        setIsGeneratingImage(true);
        setImageGenerationPrompt(content);
      }

      // Use image generation model if in photo mode
      const modelToUse = chatMode === 'photo' ? 'google/gemini-2.5-flash-image-preview' : selectedModel;
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken || import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          'apikey': import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY
        },
        body: JSON.stringify({
          message: content,
          model: modelToUse,
          mode: chatMode,
          image: filePreview,
          fileText: fileTextToSend,
          fileName: fileNameToSend,
          conversationHistory: conversationHistory
        })
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      if (!reader) {
        throw new Error("No response body");
      }
      let accumulatedContent = "";
      let receivedImages: any[] = [];
      let buffer = "";
      let sawDone = false;

      // Hide typing indicator once streaming starts
      setIsAITyping(false);
      while (true) {
        const {
          done,
          value
        } = await reader.read();
        if (done) {
          // process any remaining buffered line
          if (buffer.length > 0) {
            const line = buffer;
            if (line.startsWith('data: ')) {
              const data = line.slice(6);
              if (data !== '[DONE]') {
                try {
                  const parsed = JSON.parse(data);
                  const content = parsed.content;
                  const images = parsed.images;
                  if (content) {
                    accumulatedContent += content;
                    await updateMessage(aiMessage.id, accumulatedContent);
                  }
                  if (images && images.length > 0) {
                    receivedImages = images;
                    await updateMessage(aiMessage.id, accumulatedContent, images);
                  }
                } catch {}
              }
            }
          }
          break;
        }
        buffer += decoder.decode(value, {
          stream: true
        });
        const lines = buffer.split('\n');
        buffer = lines.pop() || ""; // keep last partial line

        for (const line of lines) {
          if (!line.trim()) continue; // Skip empty lines
          if (!line.startsWith('data: ')) continue;
          const data = line.slice(6);
          if (data === '[DONE]') {
            sawDone = true;
            break;
          }
          try {
            const parsed = JSON.parse(data);
            const content = parsed.content;
            const images = parsed.images;
            if (content) {
              accumulatedContent += content;
              await updateMessage(aiMessage.id, accumulatedContent);
            }
            if (images && images.length > 0) {
              receivedImages = images;
              setIsGeneratingImage(false); // Hide overlay when image is received
              await updateMessage(aiMessage.id, accumulatedContent, images);
            }
          } catch (error) {
            // Log parsing errors for debugging but continue processing
            console.log(`Failed to parse streaming data: ${data.substring(0, 50)}...`);
          }
        }
        if (sawDone) break;
      }
      if (!accumulatedContent.trim() && receivedImages.length === 0) {
        throw new Error("No content or images received from AI");
      }
      if (receivedImages.length > 0) {
        await updateMessage(aiMessage.id, accumulatedContent, receivedImages);
      }

      // Clear selected file after sending
      setSelectedFile(null);
      setFilePreview(null);
    } catch (error) {
      console.error('Error calling AI:', error);
      toast.error("Failed to get AI response. Please try again.");
    } finally {
      setIsLoading(false);
      setIsAITyping(false);
      setIsGeneratingImage(false);
      setImageGenerationPrompt("");
    }
  };
  const handleExportChat = async (chatId: string, format: 'text' | 'pdf') => {
    try {
      const chat = chats.find(c => c.id === chatId);
      if (!chat) {
        toast.error("Chat not found");
        return;
      }

      // Load messages for the chat
      const {
        data: chatMessages,
        error
      } = await supabase.from('messages').select('*').eq('chat_id', chatId).order('created_at', {
        ascending: true
      });
      if (error) throw error;
      if (!chatMessages || chatMessages.length === 0) {
        toast.error("No messages to export");
        return;
      }
      if (format === 'text') {
        exportChatAsText(chat.title, chatMessages);
        toast.success("Chat exported as text file");
      } else {
        await exportChatAsPDF(chat.title, chatMessages);
        toast.success("Chat exported as PDF");
      }
    } catch (error) {
      console.error('Error exporting chat:', error);
      toast.error("Failed to export chat");
    }
  };
  return <div className="flex h-screen bg-background overflow-hidden">
      {/* Sidebar */}
      <AnimatePresence mode="wait">
        {!sidebarCollapsed && <>
            {/* Mobile Overlay - only on mobile */}
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }} 
              className="fixed inset-0 bg-black/50 z-40 md:hidden" 
              onClick={() => setSidebarCollapsed(true)} 
            />
            {/* Sidebar Container */}
            <motion.div 
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ duration: 0.2, ease: "easeInOut" }} 
              className="fixed md:static h-full w-[280px] z-50 md:z-auto shrink-0 bg-sidebar border-r border-border"
            >
              <ChatSidebar 
                chats={chats} 
                currentChat={currentChat} 
                onSelectChat={chat => {
                  selectChat(chat);
                  // Auto-close sidebar on mobile after selection
                  if (window.innerWidth < 768) setSidebarCollapsed(true);
                }} 
                onNewChat={() => {
                  startNewChat();
                  if (window.innerWidth < 768) setSidebarCollapsed(true);
                }} 
                onSignOut={signOut} 
                onOpenSettings={() => {
                  setShowSettings(true);
                  if (window.innerWidth < 768) setSidebarCollapsed(true);
                }} 
                onDeleteChat={deleteChat} 
                onExportChat={handleExportChat} 
                user={user} 
                onCollapse={() => setSidebarCollapsed(true)} 
              />
            </motion.div>
          </>}
      </AnimatePresence>
      
      {/* Main Content - Always visible */}
      <div className="flex-1 flex flex-col min-w-0 chat-layout-mobile">
          <div className="flex flex-col h-full relative">
            {showSettings ?
        // Settings Panel
        <div className="flex flex-col h-full">
                {/* Settings Header */}
                <div className="flex items-center justify-between p-4 border-b border-border">
                  <h2 className="text-lg font-semibold">Settings</h2>
                  <Button variant="ghost" size="sm" onClick={() => setShowSettings(false)} className="h-8 w-8 p-0">
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                
                {/* Settings Content */}
                <ScrollArea className="flex-1 p-6">
                  <div className="max-w-4xl mx-auto">
                    <Settings user={user} />
                  </div>
                </ScrollArea>
              </div> :
        // Main Chat Interface
        <>
                {/* Smart Chat Tabs - Desktop Only */}
                <div className="hidden md:block">
                  <SmartChatTabs
                    openChats={openTabs}
                    activeChat={currentChat}
                    onSelectTab={selectChat}
                    onCloseTab={handleCloseTab}
                    onNewTab={startNewChat}
                  />
                </div>
                
                {/* Header - ChatGPT Style with New Features */}
                <div className="border-b border-border px-3 py-2 sm:px-4 sm:py-3 flex justify-between items-center shrink-0 gap-2">
                  <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                    {sidebarCollapsed && <Button variant="ghost" size="sm" onClick={() => setSidebarCollapsed(false)} className="h-8 w-8 p-0 shrink-0">
                        <PanelLeft className="h-4 w-4" />
                      </Button>}
                    <h1 className="text-sm sm:text-lg font-medium text-foreground truncate">
                      {currentChat ? currentChat.title : "New conversation"}
                    </h1>
                    {/* Favorite button */}
                    {currentChat && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 w-7 p-0 shrink-0"
                        onClick={() => toggleFavorite(currentChat.id)}
                      >
                        <Star className={`h-4 w-4 ${favoriteChats.has(currentChat.id) ? 'fill-yellow-500 text-yellow-500' : 'text-muted-foreground'}`} />
                      </Button>
                    )}
                  </div>
                  
                  {/* Right side icons - ChatGPT style + New Controls */}
                  <div className="flex items-center gap-1 shrink-0">
                    {/* Memory Control - Desktop */}
                    <div className="hidden sm:block">
                      <MemoryControl chatId={currentChat?.id} />
                    </div>
                    
                    {/* Response Length Control - Desktop */}
                    <div className="hidden sm:block">
                      <ResponseLengthControl value={responseLength} onChange={setResponseLength} />
                    </div>
                    
                    {/* Search in Chat */}
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => setShowSearch(true)}
                      className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
                      title="Search (Ctrl+F)"
                      disabled={messages.length === 0}
                    >
                      <Search className="h-4 w-4" />
                    </Button>
                    
                    {/* Images */}
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => navigate('/images')} 
                      className="h-8 w-8 sm:h-9 sm:w-auto p-0 sm:px-3 text-muted-foreground hover:text-foreground"
                      title="Images"
                    >
                      <ImageIcon className="h-4 w-4" />
                      <span className="hidden sm:inline ml-2">Images</span>
                    </Button>
                    
                    {/* Temporary Messages */}
                    <Button 
                      variant={temporaryMessages ? "secondary" : "ghost"} 
                      size="sm" 
                      onClick={() => {
                        setTemporaryMessages(!temporaryMessages);
                        toast.success(temporaryMessages ? "Temporary messages off" : "Temporary messages on");
                      }} 
                      className="h-8 w-8 sm:h-9 sm:w-auto p-0 sm:px-3 text-muted-foreground hover:text-foreground"
                      title="Temporary Messages"
                    >
                      <Timer className="h-4 w-4" />
                      <span className="hidden lg:inline ml-2">Temporary</span>
                    </Button>
                    
                    {/* Group Chat */}
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => navigate('/group-chats')} 
                      className="h-8 w-8 sm:h-9 sm:w-auto p-0 sm:px-3 text-muted-foreground hover:text-foreground"
                      title="Group Chats"
                    >
                      <Users className="h-4 w-4" />
                      <span className="hidden lg:inline ml-2">Groups</span>
                    </Button>
                  </div>
                </div>
                
                {/* Pinned Messages */}
                <PinnedMessages 
                  chatId={currentChat?.id}
                  onUnpin={() => {}}
                  onScrollTo={scrollToMessage}
                />
                
                {/* Chat Search */}
                <ChatSearch
                  messages={messages}
                  onScrollToMessage={scrollToMessage}
                  isOpen={showSearch}
                  onClose={() => setShowSearch(false)}
                />
                
                {/* Messages - ONLY scrollable area (ChatGPT-style) */}
                <div className="chat-messages-container" ref={scrollAreaRef}>
                  {/* Scroll to bottom button - only show when there are messages */}
                  {messages.length > 0 && <ScrollToBottom scrollAreaRef={scrollAreaRef} hasNewMessage={hasNewMessage} onScrollToBottom={() => setHasNewMessage(false)} />}
                  
                  <div className="p-3 sm:p-6 pb-4 min-h-full flex flex-col">
                    <div className="max-w-4xl mx-auto w-full flex-1 flex flex-col">
                      {messages.length === 0 ? <div className="flex-1 flex flex-col items-center justify-center py-8 sm:py-12">
                          {/* Quick Actions */}
                          <AnimatePresence mode="wait">
                            {showQuickActions ? <motion.div key="cards" className="w-full max-w-xl px-2" initial={{
                      opacity: 0,
                      y: 20
                    }} animate={{
                      opacity: 1,
                      y: 0
                    }} exit={{
                      opacity: 0,
                      scale: 0.95
                    }} transition={{
                      duration: 0.3,
                      ease: "easeOut"
                    }}>
                                <QuickActionCards onAction={handleSendMessage} onSkip={() => setShowQuickActions(false)} />
                              </motion.div> : <motion.div key="show-btn" initial={{
                      opacity: 0,
                      scale: 0.9
                    }} animate={{
                      opacity: 1,
                      scale: 1
                    }} exit={{
                      opacity: 0,
                      scale: 0.9
                    }} transition={{
                      duration: 0.2
                    }}>
                                <Button variant="outline" size="default" onClick={() => setShowQuickActions(true)} className="text-sm font-medium">
                                  Show quick actions
                                </Button>
                              </motion.div>}
                          </AnimatePresence>
                        </div> : <VirtualizedChatMessages 
                          messages={messages}
                          chatId={currentChat?.id}
                          isAITyping={isAITyping}
                          onEditMessage={handleEditMessage}
                          onRegenerateResponse={handleRegenerateResponse}
                        />}
                    </div>
                  </div>
                </div>
              </>}
            
            {/* Input - Always fixed at bottom with sticky positioning */}
            {!showSettings && <div className="chat-input-fixed border-t border-border">
                {/* Quick Action Buttons - Desktop only */}
                {messages.length > 0 && (
                  <div className="hidden md:flex justify-center py-2">
                    <QuickActionButtons
                      onRewrite={() => handleQuickAction('rewrite')}
                      onSummarize={() => handleQuickAction('summarize')}
                      onTranslate={() => handleQuickAction('translate')}
                      onImprove={() => handleQuickAction('improve')}
                      onRegenerate={() => handleQuickAction('regenerate')}
                      disabled={isLoading}
                      hasMessage={messages.some(m => !m.is_user)}
                    />
                  </div>
                )}
                
                {/* File Preview */}
                {selectedFile && <div className="p-4">
                    <div className="max-w-4xl mx-auto">
                      <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                        {filePreview && <img src={filePreview} alt="Preview" className="w-16 h-16 object-cover rounded" />}
                        <div className="flex-1">
                          <p className="text-sm font-medium">{selectedFile.name}</p>
                          <p className="text-xs text-muted-foreground">{(selectedFile.size / 1024).toFixed(2)} KB</p>
                        </div>
                        <Button variant="ghost" size="sm" onClick={() => {
                  setSelectedFile(null);
                  setFilePreview(null);
                }}>
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>}
                <div className="px-2 py-3 sm:p-4">
                  <div className="max-w-4xl mx-auto w-full">
                    <ChatInput onSendMessage={handleSendMessage} disabled={isLoading} onFileSelect={handleFileSelect} onModeChange={setChatMode} editingMessage={editingMessage} onCancelEdit={() => setEditingMessage(null)} onTypingChange={setIsUserTyping} />
                  </div>
                </div>
              </div>}
          </div>
      </div>
      
      {/* Floating Action Button - Mobile Only */}
      <FloatingActionButton
        onNewChat={startNewChat}
        onVoiceInput={() => {
          const micButton = document.querySelector('[data-voice-input]') as HTMLButtonElement;
          if (micButton) micButton.click();
          else toast.info("Tap the microphone in the input bar");
        }}
        onCameraUpload={() => {
          const cameraButton = document.querySelector('[data-camera-upload]') as HTMLButtonElement;
          if (cameraButton) cameraButton.click();
          else toast.info("Camera upload coming soon");
        }}
        onImageUpload={() => {
          const fileInput = document.getElementById('file-upload') as HTMLInputElement;
          if (fileInput) fileInput.click();
        }}
        isTyping={isUserTyping}
        isLoading={isLoading || isAITyping}
      />
      
      {/* Image Generation Overlay */}
      <ImageGeneratingOverlay 
        isGenerating={isGeneratingImage} 
        prompt={imageGenerationPrompt} 
      />
      
      {/* Offline indicator */}
      <AnimatePresence>
        {!isOnline && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-20 left-4 right-4 md:left-auto md:right-4 md:w-72 z-50"
          >
            <div className="bg-destructive/90 backdrop-blur-sm text-destructive-foreground px-4 py-3 rounded-lg shadow-lg">
              <p className="text-sm font-medium">You're offline</p>
              <p className="text-xs opacity-80">Messages will be sent when you're back online</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>;
};
export default Index;