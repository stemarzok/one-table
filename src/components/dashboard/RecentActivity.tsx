import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock, CheckCircle, XCircle, User, Calendar, Check, X } from "lucide-react";
import { toast } from "sonner";

interface RecentActivityProps {
  restaurantId: string;
  hasProAccess: boolean;
  onViewAll: () => void;
}

interface Booking {
  id: string;
  user_name: string;
  booking_date: string;
  booking_time: string;
  guests_count: number;
  status: string;
  created_at: string;
}

export const RecentActivity = ({ restaurantId, hasProAccess, onViewAll }: RecentActivityProps) => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchBookings = async () => {
    const { data } = await supabase
      .from("bookings")
      .select("id, user_name, booking_date, booking_time, guests_count, status, created_at")
      .eq("restaurant_id", restaurantId)
      .order("created_at", { ascending: false })
      .limit(5);

    setBookings(data || []);
    setLoading(false);
  };

  useEffect(() => {
    if (restaurantId) fetchBookings();
  }, [restaurantId]);

  const handleUpdateStatus = async (bookingId: string, newStatus: "confirmed" | "cancelled") => {
    const { error } = await supabase
      .from("bookings")
      .update({ status: newStatus })
      .eq("id", bookingId);

    if (error) {
      toast.error("Errore nell'aggiornamento");
    } else {
      toast.success(newStatus === "confirmed" ? "Prenotazione confermata" : "Prenotazione annullata");
      fetchBookings();
    }
  };

  const getStatusConfig = (status: string) => {
    switch (status) {
      case "confirmed":
        return { label: "Confermata", variant: "default" as const, icon: CheckCircle, className: "bg-primary/10 text-primary border-primary/20" };
      case "pending":
        return { label: "In attesa", variant: "secondary" as const, icon: Clock, className: "bg-amber-500/10 text-amber-600 border-amber-500/20" };
      case "cancelled":
        return { label: "Annullata", variant: "destructive" as const, icon: XCircle, className: "bg-destructive/10 text-destructive border-destructive/20" };
      default:
        return { label: status, variant: "outline" as const, icon: Clock, className: "" };
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("it-IT", { day: "numeric", month: "short" });
  };

  const formatTime = (timeStr: string) => {
    return timeStr.slice(0, 5);
  };

  if (loading) {
    return (
      <Card className="p-6">
        <div className="animate-pulse space-y-3">
          <div className="h-4 bg-muted rounded w-1/3" />
          <div className="h-12 bg-muted rounded" />
          <div className="h-12 bg-muted rounded" />
          <div className="h-12 bg-muted rounded" />
        </div>
      </Card>
    );
  }

  if (bookings.length === 0) {
    return (
      <Card className="p-6">
        <div className="text-center py-8">
          <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground">Nessuna prenotazione recente</p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden">
      <div className="p-4 border-b bg-muted/30">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold">Attività Recenti</h3>
          <Button variant="ghost" size="sm" onClick={onViewAll} className="text-primary">
            Vedi tutte
          </Button>
        </div>
      </div>
      <div className="divide-y">
        {bookings.map((booking) => {
          const statusConfig = getStatusConfig(booking.status);
          const StatusIcon = statusConfig.icon;

          return (
            <div key={booking.id} className="p-4 hover:bg-muted/30 transition-colors">
              <div className="flex items-center gap-4">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                  <User className="w-5 h-5 text-muted-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{booking.user_name}</p>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span>{formatDate(booking.booking_date)}</span>
                    <span>•</span>
                    <span>{formatTime(booking.booking_time)}</span>
                    <span>•</span>
                    <span>{booking.guests_count} ospiti</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className={statusConfig.className}>
                    <StatusIcon className="w-3 h-3 mr-1" />
                    {statusConfig.label}
                  </Badge>
                  {booking.status === "pending" && hasProAccess && (
                    <div className="flex gap-1 ml-2">
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-7 w-7 text-primary hover:text-primary hover:bg-primary/10"
                        onClick={() => handleUpdateStatus(booking.id, "confirmed")}
                      >
                        <Check className="w-4 h-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-7 w-7 text-destructive hover:text-destructive hover:bg-destructive/10"
                        onClick={() => handleUpdateStatus(booking.id, "cancelled")}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
};
