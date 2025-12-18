import { useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

const generateSessionId = () => {
  let sessionId = sessionStorage.getItem('analytics_session_id');
  if (!sessionId) {
    sessionId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    sessionStorage.setItem('analytics_session_id', sessionId);
  }
  return sessionId;
};

export const useAnalytics = () => {
  const { user } = useAuth();
  const sessionId = useRef(generateSessionId());
  const lastClick = useRef<number>(0);

  const trackEvent = useCallback(async (
    eventType: string,
    metadata: Record<string, any> = {},
    element?: HTMLElement
  ) => {
    try {
      const data: any = {
        session_id: sessionId.current,
        user_id: user?.id || null,
        event_type: eventType,
        page_path: window.location.pathname,
        viewport_width: window.innerWidth,
        viewport_height: window.innerHeight,
        metadata: {
          ...metadata,
          timestamp: new Date().toISOString(),
          userAgent: navigator.userAgent
        }
      };

      if (element) {
        data.element_id = element.id || null;
        data.element_class = element.className || null;
        
        const rect = element.getBoundingClientRect();
        data.x_position = Math.round(rect.left + rect.width / 2);
        data.y_position = Math.round(rect.top + rect.height / 2 + window.scrollY);
      }

      await supabase.from('user_analytics').insert(data);
    } catch (error) {
      // Silently fail - analytics shouldn't break the app
      console.error('Analytics error:', error);
    }
  }, [user?.id]);

  // Track page views
  useEffect(() => {
    trackEvent('page_view', { 
      referrer: document.referrer,
      title: document.title 
    });
  }, [trackEvent]);

  // Track clicks
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      // Throttle clicks to max 1 per 100ms
      const now = Date.now();
      if (now - lastClick.current < 100) return;
      lastClick.current = now;

      const target = e.target as HTMLElement;
      const button = target.closest('button');
      const link = target.closest('a');
      const clickable = button || link || target.closest('[role="button"]');

      if (clickable) {
        trackEvent('click', {
          tagName: clickable.tagName,
          text: (clickable as HTMLElement).innerText?.slice(0, 50),
          href: (clickable as HTMLAnchorElement).href || null
        }, clickable as HTMLElement);
      }
    };

    document.addEventListener('click', handleClick, { passive: true });
    return () => document.removeEventListener('click', handleClick);
  }, [trackEvent]);

  // Track scroll depth
  useEffect(() => {
    let maxScroll = 0;
    let ticking = false;

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const scrollPercent = Math.round(
            (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100
          );
          
          // Only track at 25%, 50%, 75%, 100% milestones
          const milestones = [25, 50, 75, 100];
          for (const milestone of milestones) {
            if (scrollPercent >= milestone && maxScroll < milestone) {
              maxScroll = milestone;
              trackEvent('scroll_depth', { depth: milestone });
            }
          }
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [trackEvent]);

  return { trackEvent };
};

export default useAnalytics;