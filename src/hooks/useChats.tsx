import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const sb = supabase as any;

export interface Chat {
  id: string;
  title: string;
  created_at: string;
  updated_at: string;
}

export interface Message {
  id: string;
  chat_id: string;
  content: string;
  is_user: boolean;
  created_at: string;
  images?: any;
}

export const useChats = (userId: string | undefined) => {
  const [chats, setChats] = useState<Chat[]>([]);
  const [currentChat, setCurrentChat] = useState<Chat | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);

  // Load user's chats
  const loadChats = async () => {
    if (!userId) return;

    try {
      const { data, error } = await sb
        .from('chats')
        .select('*')
        .eq('user_id', userId)
        .order('updated_at', { ascending: false });

      if (error) throw error;
      setChats(data || []);
    } catch (error: any) {
      console.error('Error loading chats:', error);
      toast.error('Failed to load chats');
    }
  };

  // Load messages for a specific chat
  const loadMessages = async (chatId: string) => {
    try {
      const { data, error } = await sb
        .from('messages')
        .select('*')
        .eq('chat_id', chatId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setMessages(data || []);
    } catch (error: any) {
      console.error('Error loading messages:', error);
      toast.error('Failed to load messages');
    }
  };

  // Create a new chat
  const createChat = async (title: string): Promise<Chat | null> => {
    if (!userId) return null;

    try {
      const { data, error } = await sb
        .from('chats')
        .insert({
          user_id: userId,
          title: title,
        })
        .select()
        .single();

      if (error) throw error;

      const newChat = data as Chat;
      setChats(prev => [newChat, ...prev]);
      setCurrentChat(newChat);
      setMessages([]);
      
      return newChat;
    } catch (error: any) {
      console.error('Error creating chat:', error);
      toast.error('Failed to create chat');
      return null;
    }
  };

  // Add a message to the current chat
  const addMessage = async (chatId: string, content: string, isUser: boolean, images?: any[]): Promise<Message | null> => {
    try {
      const messageData: any = {
        chat_id: chatId,
        content: content,
        is_user: isUser,
      };

      // Add images if provided
      if (images && images.length > 0) {
        messageData.images = images;
      }

      const { data, error } = await sb
        .from('messages')
        .insert(messageData)
        .select()
        .single();

      if (error) throw error;

      const newMessage = data as Message;
      setMessages(prev => [...prev, newMessage]);

      // Update chat's updated_at timestamp
      await sb
        .from('chats')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', chatId);

      return newMessage;
    } catch (error: any) {
      console.error('Error adding message:', error);
      toast.error('Failed to save message');
      return null;
    }
  };

  // Update a message (for streaming responses)
  const updateMessage = async (messageId: string, content: string, images?: any[]) => {
    try {
      const updateData: any = { content };
      
      // Add images if provided
      if (images && images.length > 0) {
        updateData.images = images;
      }

      const { error } = await sb
        .from('messages')
        .update(updateData)
        .eq('id', messageId);

      if (error) throw error;

      setMessages(prev => 
        prev.map(msg => 
          msg.id === messageId 
            ? { ...msg, content, ...(images ? { images } : {}) }
            : msg
        )
      );
    } catch (error: any) {
      console.error('Error updating message:', error);
    }
  };

  // Delete a message
  const deleteMessage = async (messageId: string) => {
    try {
      const { error } = await sb
        .from('messages')
        .delete()
        .eq('id', messageId);

      if (error) throw error;

      setMessages(prev => prev.filter(msg => msg.id !== messageId));
    } catch (error: any) {
      console.error('Error deleting message:', error);
    }
  };

  // Start a new chat session
  const startNewChat = () => {
    setCurrentChat(null);
    setMessages([]);
  };

  // Select an existing chat
  const selectChat = async (chat: Chat) => {
    setCurrentChat(chat);
    await loadMessages(chat.id);
  };

  // Delete a chat
  const deleteChat = async (chatId: string) => {
    try {
      // Delete all messages in the chat first
      const { error: messagesError } = await sb
        .from('messages')
        .delete()
        .eq('chat_id', chatId);

      if (messagesError) throw messagesError;

      // Delete the chat
      const { error: chatError } = await sb
        .from('chats')
        .delete()
        .eq('id', chatId);

      if (chatError) throw chatError;

      // Update local state
      setChats(prev => prev.filter(chat => chat.id !== chatId));
      
      // If the deleted chat was the current one, clear it
      if (currentChat?.id === chatId) {
        setCurrentChat(null);
        setMessages([]);
      }

      toast.success('Chat deleted successfully');
    } catch (error: any) {
      console.error('Error deleting chat:', error);
      toast.error('Failed to delete chat');
    }
  };

  useEffect(() => {
    if (userId) {
      loadChats();
    }
  }, [userId]);

  return {
    chats,
    currentChat,
    messages,
    loading,
    createChat,
    addMessage,
    updateMessage,
    deleteMessage,
    startNewChat,
    selectChat,
    loadChats,
    deleteChat,
  };
};