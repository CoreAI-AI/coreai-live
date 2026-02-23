import { useState, useEffect } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAuth, setShowAuth] = useState(false);

  useEffect(() => {
    // Listen for auth changes first
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.id);
        setUser(session?.user ?? null);
        
        if (event === 'SIGNED_IN') {
          setShowAuth(false);
        } else if (event === 'SIGNED_OUT') {
          setShowAuth(true);
        }
        
        setLoading(false);
      }
    );

    // Get initial session - require login if no session
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      console.log('Initial session:', session?.user?.id);
      
      if (session?.user) {
        setUser(session.user);
        setShowAuth(false);
      } else {
        // No session - require login
        setUser(null);
        setShowAuth(true);
      }
      
      setLoading(false);
    };

    getSession();

    return () => subscription.unsubscribe();
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setShowAuth(true);
    toast.success("Signed out successfully!");
  };

  return {
    user,
    loading,
    showAuth,
    signOut,
    setShowAuth,
  };
};