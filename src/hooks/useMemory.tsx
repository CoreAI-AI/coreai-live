import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface Memory {
  key: string;
  value: any;
  updated_at?: string;
}

export const useMemory = (userId: string | undefined) => {
  const [memory, setMemory] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);

  const loadMemory = useCallback(async () => {
    if (!userId) return;

    try {
      const { data, error } = await supabase
        .from('memory')
        .select('*')
        .eq('user_id', userId);

      if (error) throw error;

      const memoryMap: Record<string, any> = {};
      data?.forEach((item: any) => {
        memoryMap[item.memory_key] = item.memory_value;
      });
      setMemory(memoryMap);
    } catch (error) {
      console.error('Error loading memory:', error);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    loadMemory();
  }, [loadMemory]);

  const updateMemory = useCallback(async (key: string, value: any) => {
    if (!userId) return;

    try {
      const { error } = await supabase
        .from('memory')
        .upsert({
          user_id: userId,
          memory_key: key,
          memory_value: value,
        });

      if (error) throw error;

      setMemory(prev => ({ ...prev, [key]: value }));
    } catch (error) {
      console.error('Error updating memory:', error);
      toast.error('Failed to save memory');
    }
  }, [userId]);

  const getMemory = useCallback((key: string, defaultValue: any = null) => {
    return memory[key] ?? defaultValue;
  }, [memory]);

  const clearMemory = useCallback(async () => {
    if (!userId) return;

    try {
      const { error } = await supabase
        .from('memory')
        .delete()
        .eq('user_id', userId);

      if (error) throw error;

      setMemory({});
      toast.success('Memory cleared successfully');
    } catch (error) {
      console.error('Error clearing memory:', error);
      toast.error('Failed to clear memory');
    }
  }, [userId]);

  return {
    memory,
    loading,
    updateMemory,
    getMemory,
    clearMemory,
  };
};