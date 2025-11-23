import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar, Users, Clock, CheckCircle, XCircle, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { useLanguage } from "@/contexts/LanguageContext";

interface Booking {
  id: string;
  booking_date: string;
  booking_time: string;
  guests_count: number;
  status: string;
  user_name: string;
  user_email: string;
  user_phone: string | null;
  special_requests: string | null;
  table_id: string | null;
  created_at: string;
}

interface Table {
  id: string;
  table_number: string;
  seats: number;
}

interface BookingsManagementProps {
  restaurantId: string;
}

export const BookingsManagement = ({ restaurantId }: BookingsManagementProps) => {
  const { t } = useLanguage();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [tables, setTables] = useState<Table[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("all");

  useEffect(() => {
    fetchBookings();
    fetchTables();
    
    // Subscribe to realtime updates
    const channel = supabase
      .channel('bookings-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'bookings',
          filter: `restaurant_id=eq.${restaurantId}`
        },
        () => {
          fetchBookings();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [restaurantId]);

  const fetchBookings = async () => {
    try {
      const { data, error } = await supabase
        .from("bookings")
        .select("*")
        .eq("restaurant_id", restaurantId)
        .order("booking_date", { ascending: true })
        .order("booking_time", { ascending: true });

      if (error) throw error;
      setBookings(data || []);
    } catch (error) {
      console.error("Error fetching bookings:", error);
      toast.error("Errore nel caricamento delle prenotazioni");
    } finally {
      setLoading(false);
    }
  };

  const fetchTables = async () => {
    const { data } = await supabase
      .from("restaurant_tables")
      .select("id, table_number, seats")
      .eq("restaurant_id", restaurantId)
      .order("table_number");

    setTables(data || []);
  };

  const updateBookingStatus = async (bookingId: string, status: string) => {
    try {
      // Get booking details before updating
      const booking = bookings.find(b => b.id === bookingId);
      
      const { error } = await supabase
        .from("bookings")
        .update({ status })
        .eq("id", bookingId);

      if (error) throw error;
      
      // Send confirmation email when status is changed to confirmed
      if (status === "confirmed" && booking) {
        try {
          // Get restaurant name
          const { data: restaurant } = await supabase
            .from("restaurants")
            .select("name")
            .eq("id", restaurantId)
            .single();

          await supabase.functions.invoke("send-booking-confirmation", {
            body: {
              userEmail: booking.user_email,
              userName: booking.user_name,
              restaurantName: restaurant?.name || "il ristorante",
              bookingDate: booking.booking_date,
              bookingTime: booking.booking_time,
              guestsCount: booking.guests_count,
              specialRequests: booking.special_requests,
            },
          });
          console.log("Confirmation email sent successfully");
        } catch (emailError) {
          console.error("Error sending confirmation email:", emailError);
          // Don't fail the status update if email fails
        }
      }
      
      toast.success(`Prenotazione ${status === "confirmed" ? "confermata" : status === "cancelled" ? "annullata" : "completata"}`);
      fetchBookings();
    } catch (error) {
      console.error("Error updating booking:", error);
      toast.error("Errore nell'aggiornamento della prenotazione");
    }
  };

  const assignTable = async (bookingId: string, tableId: string) => {
    try {
      const { error } = await supabase
        .from("bookings")
        .update({ table_id: tableId })
        .eq("id", bookingId);

      if (error) throw error;
      
      toast.success("Tavolo assegnato");
      fetchBookings();
    } catch (error) {
      console.error("Error assigning table:", error);
      toast.error("Errore nell'assegnazione del tavolo");
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed":
        return "bg-green-500/10 text-green-500 border-green-500/20";
      case "pending":
        return "bg-yellow-500/10 text-yellow-500 border-yellow-500/20";
      case "cancelled":
        return "bg-red-500/10 text-red-500 border-red-500/20";
      case "completed":
        return "bg-blue-500/10 text-blue-500 border-blue-500/20";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "confirmed":
        return <CheckCircle className="w-4 h-4" />;
      case "pending":
        return <AlertCircle className="w-4 h-4" />;
      case "cancelled":
        return <XCircle className="w-4 h-4" />;
      default:
        return <CheckCircle className="w-4 h-4" />;
    }
  };

  const filteredBookings = bookings.filter(booking => {
    if (filter === "all") return true;
    return booking.status === filter;
  });

  if (loading) {
    return <div className="text-center py-8">Caricamento prenotazioni...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Gestione Prenotazioni</h2>
        <Select value={filter} onValueChange={setFilter}>
          <SelectTrigger className="w-[200px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tutte</SelectItem>
            <SelectItem value="pending">In Attesa</SelectItem>
            <SelectItem value="confirmed">Confermate</SelectItem>
            <SelectItem value="completed">Completate</SelectItem>
            <SelectItem value="cancelled">Annullate</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {filteredBookings.length === 0 ? (
        <Card className="p-12 text-center">
          <Calendar className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <p className="text-xl text-muted-foreground">Nessuna prenotazione trovata</p>
        </Card>
      ) : (
        <div className="grid gap-4">
          {filteredBookings.map((booking) => (
            <Card key={booking.id} className="p-6">
              <div className="flex flex-col md:flex-row gap-6">
                <div className="flex-1 space-y-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-xl font-semibold">{booking.user_name}</h3>
                      <p className="text-sm text-muted-foreground">{booking.user_email}</p>
                      {booking.user_phone && (
                        <p className="text-sm text-muted-foreground">{booking.user_phone}</p>
                      )}
                    </div>
                    <Badge className={getStatusColor(booking.status)}>
                      <span className="flex items-center gap-1">
                        {getStatusIcon(booking.status)}
                        {booking.status}
                      </span>
                    </Badge>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Calendar className="w-4 h-4" />
                      <span>{new Date(booking.booking_date).toLocaleDateString('it-IT')}</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Clock className="w-4 h-4" />
                      <span>{booking.booking_time}</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Users className="w-4 h-4" />
                      <span>{booking.guests_count} ospiti</span>
                    </div>
                  </div>

                  {booking.special_requests && (
                    <div className="p-3 bg-muted rounded-lg">
                      <p className="text-sm font-medium mb-1">Richieste Speciali:</p>
                      <p className="text-sm text-muted-foreground">{booking.special_requests}</p>
                    </div>
                  )}

                  <div className="flex items-center gap-2">
                    <Select
                      value={booking.table_id || ""}
                      onValueChange={(value) => assignTable(booking.id, value)}
                    >
                      <SelectTrigger className="w-[200px]">
                        <SelectValue placeholder="Assegna tavolo" />
                      </SelectTrigger>
                      <SelectContent>
                        {tables
                          .filter(table => table.seats >= booking.guests_count)
                          .map((table) => (
                            <SelectItem key={table.id} value={table.id}>
                              Tavolo {table.table_number} ({table.seats} posti)
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                    {booking.table_id && (
                      <span className="text-sm text-muted-foreground">
                        Tavolo assegnato: {tables.find(t => t.id === booking.table_id)?.table_number}
                      </span>
                    )}
                  </div>
                </div>

                {booking.status === "pending" && (
                  <div className="flex md:flex-col gap-2">
                    <Button
                      onClick={() => updateBookingStatus(booking.id, "confirmed")}
                      className="flex-1 md:flex-none"
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Conferma
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={() => updateBookingStatus(booking.id, "cancelled")}
                      className="flex-1 md:flex-none"
                    >
                      <XCircle className="w-4 h-4 mr-2" />
                      Annulla
                    </Button>
                  </div>
                )}
                
                {booking.status === "pending" && new Date(booking.booking_date) < new Date() && (
                  <Button
                    variant="outline"
                    onClick={() => updateBookingStatus(booking.id, "cancelled")}
                    className="w-full"
                  >
                    <XCircle className="w-4 h-4 mr-2" />
                    Annulla (scaduta)
                  </Button>
                )}

                {booking.status === "confirmed" && (
                  <div className="flex md:flex-col gap-2">
                    <Button
                      onClick={() => updateBookingStatus(booking.id, "completed")}
                      className="flex-1 md:flex-none"
                    >
                      Completa
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => updateBookingStatus(booking.id, "cancelled")}
                      className="flex-1 md:flex-none"
                    >
                      Annulla
                    </Button>
                  </div>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
