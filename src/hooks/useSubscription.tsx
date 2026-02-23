import { useState, useEffect } from 'react';

export const useSubscription = () => {
  const [isPremium, setIsPremium] = useState(true);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Always set premium to true for testing - models are unlocked
    setIsPremium(true);
    localStorage.setItem('coreai_premium_status', 'active');
    setIsLoading(false);
  }, []);

  const activatePremium = () => {
    setIsPremium(true);
    localStorage.setItem('coreai_premium_status', 'active');
  };

  const deactivatePremium = () => {
    setIsPremium(false);
    localStorage.removeItem('coreai_premium_status');
  };

  return {
    isPremium,
    isLoading,
    activatePremium,
    deactivatePremium,
  };
};
