import { supabase } from '@/integrations/supabase/client';
import { useCallback } from 'react';

export const useUsageTracking = (userId: string | undefined) => {
  const trackUsage = useCallback(async (
    actionType: string,
    modelUsed?: string,
    tokensUsed?: number
  ) => {
    if (!userId) return;

    try {
      await supabase.from('usage_logs').insert({
        user_id: userId,
        action_type: actionType,
        model_used: modelUsed,
        tokens_used: tokensUsed,
      });
    } catch (error) {
      console.error('Failed to track usage:', error);
    }
  }, [userId]);

  return { trackUsage };
};
