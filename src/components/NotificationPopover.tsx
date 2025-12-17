import { useEffect, useState } from "react";
import { Bell, CheckCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useBusinessRole } from "@/hooks/useBusinessRole";
import { format } from "date-fns";
import { it } from "date-fns/locale";
import { useNavigate } from "react-router-dom";

interface Notification {
  id: string;
  title: string;
  message: string;
  type: string;
  is_read: boolean;
  created_at: string;
  link: string | null;
}

export const NotificationPopover = () => {
  const { user, isBusinessMode } = useAuth();
  const { businessRoles } = useBusinessRole();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [open, setOpen] = useState(false);

  const fetchNotifications = async () => {
    if (!user) return;

    const restaurantIds = businessRoles.map(r => r.restaurant_id);
    
    let query = supabase
      .from('notifications')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(20);

    if (isBusinessMode && restaurantIds.length > 0) {
      query = query.or(`user_id.eq.${user.id},restaurant_id.in.(${restaurantIds.join(',')})`);
    } else {
      query = query.eq('user_id', user.id);
    }
    
    const { data, error } = await query;

    if (!error && data) {
      setNotifications(data);
      setUnreadCount(data.filter(n => !n.is_read).length);
    }
  };

  useEffect(() => {
    fetchNotifications();

    if (user) {
      const channel = supabase
        .channel('notification-popover')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'notifications'
          },
          () => fetchNotifications()
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [user, businessRoles, isBusinessMode]);

  const handleNotificationClick = async (notification: Notification) => {
    await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', notification.id);
    
    fetchNotifications();
    setOpen(false);

    if (notification.link) {
      navigate(notification.link);
    } else {
      const type = notification.type;
      if (isBusinessMode) {
        if (type === 'booking' || type === 'new_booking' || type === 'booking_cancelled') {
          navigate('/dashboard?tab=prenotazioni');
        } else if (type === 'review' || type === 'new_review') {
          navigate('/dashboard?tab=recensioni');
        } else if (type === 'application_approved' || type === 'application_rejected') {
          navigate('/dashboard');
        }
      } else {
        if (type === 'booking' || type === 'booking_confirmed' || type === 'booking_cancelled') {
          navigate('/profile');
        } else if (type === 'points' || type === 'level_up') {
          navigate('/profile');
        }
      }
    }
  };

  const markAllAsRead = async () => {
    if (!user) return;
    
    const restaurantIds = businessRoles.map(r => r.restaurant_id);
    
    if (isBusinessMode && restaurantIds.length > 0) {
      await supabase
        .from('notifications')
        .update({ is_read: true })
        .or(`user_id.eq.${user.id},restaurant_id.in.(${restaurantIds.join(',')})`)
        .eq('is_read', false);
    } else {
      await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('user_id', user.id)
        .eq('is_read', false);
    }
    
    fetchNotifications();
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative rounded-full"
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
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="flex items-center justify-between p-4 border-b">
          <h4 className="font-semibold">Notifiche</h4>
          {unreadCount > 0 && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={markAllAsRead}
              className="text-xs h-7"
            >
              <CheckCheck className="w-3 h-3 mr-1" />
              Segna tutte lette
            </Button>
          )}
        </div>
        <ScrollArea className="h-80">
          {notifications.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              Nessuna notifica
            </div>
          ) : (
            <div className="divide-y">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-4 cursor-pointer hover:bg-muted/50 transition-colors ${
                    !notification.is_read ? 'bg-primary/5' : ''
                  }`}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-medium truncate ${!notification.is_read ? 'text-primary' : ''}`}>
                        {notification.title}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                        {notification.message}
                      </p>
                      <p className="text-xs text-muted-foreground mt-2">
                        {format(new Date(notification.created_at), "d MMM 'alle' HH:mm", { locale: it })}
                      </p>
                    </div>
                    {!notification.is_read && (
                      <div className="w-2 h-2 bg-primary rounded-full flex-shrink-0 mt-1" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
};