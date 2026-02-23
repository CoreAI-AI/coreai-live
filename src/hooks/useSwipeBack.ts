import { useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

interface SwipeConfig {
  threshold?: number; // Minimum swipe distance to trigger navigation
  edgeWidth?: number; // Width of the edge area where swipe can start
  enabled?: boolean;
}

export const useSwipeBack = ({
  threshold = 100,
  edgeWidth = 30,
  enabled = true,
}: SwipeConfig = {}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const touchStartX = useRef<number>(0);
  const touchStartY = useRef<number>(0);
  const touchEndX = useRef<number>(0);
  const isSwiping = useRef<boolean>(false);

  useEffect(() => {
    if (!enabled) return;

    // Only enable on mobile devices
    const isMobile = window.matchMedia('(max-width: 768px)').matches;
    if (!isMobile) return;

    // Don't enable swipe back on the home page
    if (location.pathname === '/') return;

    const handleTouchStart = (e: TouchEvent) => {
      const touch = e.touches[0];
      // Only start swipe if touch begins near the left edge
      if (touch.clientX <= edgeWidth) {
        touchStartX.current = touch.clientX;
        touchStartY.current = touch.clientY;
        isSwiping.current = true;
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!isSwiping.current) return;
      touchEndX.current = e.touches[0].clientX;
    };

    const handleTouchEnd = () => {
      if (!isSwiping.current) return;

      const deltaX = touchEndX.current - touchStartX.current;
      const deltaY = Math.abs(touchEndX.current - touchStartY.current);

      // Check if it's a horizontal swipe (not vertical scroll)
      if (deltaX > threshold && deltaX > deltaY * 2) {
        navigate(-1);
      }

      // Reset
      isSwiping.current = false;
      touchStartX.current = 0;
      touchStartY.current = 0;
      touchEndX.current = 0;
    };

    document.addEventListener('touchstart', handleTouchStart, { passive: true });
    document.addEventListener('touchmove', handleTouchMove, { passive: true });
    document.addEventListener('touchend', handleTouchEnd, { passive: true });

    return () => {
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, [enabled, threshold, edgeWidth, navigate, location.pathname]);
};
