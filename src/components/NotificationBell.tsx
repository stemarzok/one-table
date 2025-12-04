import { useEffect, useState } from "react";
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useBusinessRole } from "@/hooks/useBusinessRole";

export const NotificationBell = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { businessRoles } = useBusinessRole();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const fetchUnreadCount = async () => {
      if (!user || businessRoles.length === 0) return;

      const restaurantIds = businessRoles.map(r => r.restaurant_id);
      
      const { count, error } = await supabase
        .from('notifications')
        .select('id', { count: 'exact', head: true })
        .in('restaurant_id', restaurantIds)
        .eq('is_read', false);

      if (!error && count !== null) {
        setUnreadCount(count);
      }
    };

    fetchUnreadCount();

    // Subscribe to realtime updates
    if (businessRoles.length > 0) {
      const restaurantIds = businessRoles.map(r => r.restaurant_id);
      const channel = supabase
        .channel('notification-bell')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'notifications',
            filter: `restaurant_id=in.(${restaurantIds.join(',')})`
          },
          () => fetchUnreadCount()
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [user, businessRoles]);

  const handleClick = () => {
    navigate('/dashboard?tab=notifications');
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      className="relative rounded-full"
      onClick={handleClick}
    >
      <Bell className="w-5 h-5" />
      {unreadCount > 0 && (
        <Badge 
          variant="destructive" 
          className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
        >
          {unreadCount > 9 ? '9+' : unreadCount}
        </Badge>
      )}
    </Button>
  );
};
