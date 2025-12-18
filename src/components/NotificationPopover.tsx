import { useEffect, useState, useCallback, useRef } from "react";
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
import { toast } from "sonner";

interface Notification {
  id: string;
  title: string;
  message: string;
  type: string;
  is_read: boolean;
  created_at: string;
  link: string | null;
}

// Request browser notification permission
const requestNotificationPermission = async () => {
  if (!("Notification" in window)) {
    console.log("Browser does not support notifications");
    return false;
  }
  
  if (Notification.permission === "granted") {
    return true;
  }
  
  if (Notification.permission !== "denied") {
    const permission = await Notification.requestPermission();
    return permission === "granted";
  }
  
  return false;
};

// Show browser notification
const showBrowserNotification = (title: string, message: string, onClick?: () => void) => {
  if (Notification.permission === "granted") {
    const notification = new Notification(title, {
      body: message,
      icon: "/favicon.ico",
      badge: "/favicon.ico",
      tag: "onetable-notification",
      requireInteraction: false,
    });
    
    notification.onclick = () => {
      window.focus();
      notification.close();
      onClick?.();
    };
    
    // Auto close after 5 seconds
    setTimeout(() => notification.close(), 5000);
  }
};

export const NotificationPopover = () => {
  const { user, isBusinessMode } = useAuth();
  const { businessRoles } = useBusinessRole();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [open, setOpen] = useState(false);
  const previousNotificationsRef = useRef<Set<string>>(new Set());
  const isInitialLoadRef = useRef(true);

  // Request notification permission on mount
  useEffect(() => {
    requestNotificationPermission();
  }, []);

  const fetchNotifications = useCallback(async () => {
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
      // Check for new notifications and show browser notification
      if (!isInitialLoadRef.current) {
        const newNotifications = data.filter(
          n => !previousNotificationsRef.current.has(n.id) && !n.is_read
        );
        
        newNotifications.forEach(notification => {
          showBrowserNotification(
            notification.title,
            notification.message,
            () => {
              if (notification.link) {
                navigate(notification.link);
              }
            }
          );
          
          // Also show in-app toast
          toast(notification.title, {
            description: notification.message,
          });
        });
      }
      
      // Update previous notifications set
      previousNotificationsRef.current = new Set(data.map(n => n.id));
      isInitialLoadRef.current = false;
      
      setNotifications(data);
      setUnreadCount(data.filter(n => !n.is_read).length);
    }
  }, [user, businessRoles, isBusinessMode, navigate]);

  useEffect(() => {
    fetchNotifications();

    if (user) {
      const restaurantIds = businessRoles.map(r => r.restaurant_id);
      
      // Subscribe to notifications for user
      const channel = supabase
        .channel('notifications-realtime')
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'notifications',
            filter: `user_id=eq.${user.id}`
          },
          (payload) => {
            console.log('New notification received:', payload);
            fetchNotifications();
          }
        )
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'notifications'
          },
          () => fetchNotifications()
        );
      
      // Also subscribe to restaurant notifications if in business mode
      if (isBusinessMode && restaurantIds.length > 0) {
        restaurantIds.forEach(restaurantId => {
          channel.on(
            'postgres_changes',
            {
              event: 'INSERT',
              schema: 'public',
              table: 'notifications',
              filter: `restaurant_id=eq.${restaurantId}`
            },
            (payload) => {
              console.log('New restaurant notification received:', payload);
              fetchNotifications();
            }
          );
        });
      }
      
      channel.subscribe((status) => {
        console.log('Notification channel status:', status);
      });

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [user, businessRoles, isBusinessMode, fetchNotifications]);

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
          variant="secondary"
          size="icon"
          className="relative rounded-full"
          aria-label="Notifiche"
          title="Notifiche"
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