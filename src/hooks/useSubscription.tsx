import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

interface SubscriptionData {
  subscribed: boolean;
  inTrial: boolean;
  trialDaysRemaining?: number;
  planType?: 'base' | 'pro';
  billingPeriod?: 'monthly' | 'yearly';
  currentPeriodEnd?: string;
  cancelAtPeriodEnd?: boolean;
}

export const useSubscription = () => {
  const { user, isLoggedIn } = useAuth();
  const [subscription, setSubscription] = useState<SubscriptionData>({
    subscribed: false,
    inTrial: false,
  });
  const [loading, setLoading] = useState(true);

  const checkSubscription = async (sessionId?: string) => {
    if (!isLoggedIn || !user) {
      setSubscription({ subscribed: false, inTrial: false });
      setLoading(false);
      return;
    }

    try {
      const invokeOptions = sessionId
        ? { body: { sessionId } }
        : undefined;

      const { data, error } = await supabase.functions.invoke('check-subscription', invokeOptions as any);
      
      if (error) throw error;
      
      if (data) {
        setSubscription(data as SubscriptionData);
      }
    } catch (error) {
      console.error('Error checking subscription:', error);
      setSubscription({ subscribed: false, inTrial: false });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkSubscription();

    // Auto-refresh every 60 seconds
    const interval = setInterval(checkSubscription, 60000);

    return () => clearInterval(interval);
  }, [isLoggedIn, user]);

  const hasAccess = subscription.subscribed || subscription.inTrial;

  return {
    ...subscription,
    hasAccess,
    loading,
    refresh: (sessionId?: string) => checkSubscription(sessionId),
  };
};
