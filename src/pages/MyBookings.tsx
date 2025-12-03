import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, Clock, Users, MapPin, XCircle, AlertCircle, CheckCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface Booking {
  id: string;
  booking_date: string;
  booking_time: string;
  guests_count: number;
  status: string;
  special_requests: string | null;
  created_at: string;
  restaurants: {
    id: string;
    name: string;
    address: string;
    city: string;
    phone: string;
    cover_image_url: string | null;
    logo_url: string | null;
  };
}

const MyBookings = () => {
  const { user, isLoggedIn, isBusinessMode } = useAuth();
  const navigate = useNavigate();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Business users cannot access client pages
    if (isBusinessMode) {
      navigate("/dashboard");
      return;
    }
    if (!isLoggedIn) {
      navigate("/auth");
      return;
    }
    fetchBookings();

    // Subscribe to realtime updates
    const channel = supabase
      .channel('my-bookings')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'bookings',
          filter: `user_id=eq.${user?.id}`
        },
        () => {
          fetchBookings();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [isLoggedIn, isBusinessMode, user, navigate]);

  const fetchBookings = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from("bookings")
        .select(`
          *,
          restaurants:restaurant_id (
            id,
            name,
            address,
            city,
            phone,
            cover_image_url,
            logo_url
          )
        `)
        .eq("user_id", user.id)
        .order("booking_date", { ascending: false })
        .order("booking_time", { ascending: false });

      if (error) throw error;
      setBookings(data || []);
    } catch (error) {
      console.error("Error fetching bookings:", error);
      toast.error("Errore nel caricamento delle prenotazioni");
    } finally {
      setLoading(false);
    }
  };

  const cancelBooking = async (bookingId: string, status: string) => {
    try {
      if (!user) throw new Error('Not authenticated');
      
      // Get booking details for email
      const booking = bookings.find(b => b.id === bookingId);
      if (!booking) throw new Error('Booking not found');

      // Calculate hours until booking
      const bookingDateTime = new Date(`${booking.booking_date}T${booking.booking_time}`);
      const now = new Date();
      const hoursUntilBooking = (bookingDateTime.getTime() - now.getTime()) / (1000 * 60 * 60);

      const { error } = await supabase
        .from("bookings")
        .update({ status: "cancelled" })
        .eq("id", bookingId)
        .eq("user_id", user.id)
        .in("status", ["pending", "confirmed"]);

      if (error) throw error;

      // Send cancellation email with point deduction info
      await supabase.functions.invoke('send-cancellation-email', {
        body: {
          bookingId,
          userEmail: user.email || '',
          userName: user.email || '',
          restaurantName: booking.restaurants.name,
          bookingDate: booking.booking_date,
          bookingTime: booking.booking_time,
          userId: user.id,
        }
      });

      if (hoursUntilBooking < 48 && status === 'confirmed') {
        toast.success("Prenotazione annullata. Sono stati detratti dei punti.");
      } else {
        toast.success("Prenotazione annullata.");
      }
      
      fetchBookings();
    } catch (error) {
      console.error("Error canceling booking:", error);
      toast.error("Errore nell'annullamento della prenotazione");
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
      case "completed":
        return <CheckCircle className="w-4 h-4" />;
      default:
        return <AlertCircle className="w-4 h-4" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "confirmed": return "Confermata";
      case "pending": return "In Attesa";
      case "cancelled": return "Annullata";
      case "completed": return "Completata";
      default: return status;
    }
  };

  const isUpcoming = (booking: Booking) => {
    const bookingDateTime = new Date(`${booking.booking_date}T${booking.booking_time}`);
    return bookingDateTime > new Date() && booking.status !== "cancelled" && booking.status !== "completed";
  };

  const upcomingBookings = bookings.filter(isUpcoming);
  const pastBookings = bookings.filter(b => !isUpcoming(b));

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="pt-24 pb-16">
          <div className="container mx-auto px-4 text-center">
            <p className="text-lg text-muted-foreground">Caricamento...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4">
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-2">Le Mie Prenotazioni</h1>
            <p className="text-muted-foreground">
              Gestisci le tue prenotazioni passate e future
            </p>
          </div>

          <Tabs defaultValue="upcoming" className="space-y-6">
            <TabsList className="grid w-full max-w-md mx-auto grid-cols-2">
              <TabsTrigger value="upcoming">
                Prossime ({upcomingBookings.length})
              </TabsTrigger>
              <TabsTrigger value="past">
                Passate ({pastBookings.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="upcoming" className="space-y-4">
              {upcomingBookings.length === 0 ? (
                <Card className="p-12 text-center">
                  <Calendar className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-2">Nessuna prenotazione futura</h3>
                  <p className="text-muted-foreground mb-6">
                    Non hai ancora prenotazioni in programma
                  </p>
                  <Button onClick={() => navigate("/")}>
                    Cerca Ristoranti
                  </Button>
                </Card>
              ) : (
                upcomingBookings.map((booking) => (
                  <Card key={booking.id} className="p-6 hover:shadow-lg transition-shadow">
                    <div className="flex flex-col md:flex-row gap-6">
                      <div
                        className="w-full md:w-48 h-32 rounded-lg bg-cover bg-center flex-shrink-0"
                        style={{
                          backgroundImage: `url(${
                            booking.restaurants.cover_image_url ||
                            booking.restaurants.logo_url ||
                            "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400&q=80"
                          })`
                        }}
                      />

                      <div className="flex-1 space-y-4">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3
                              className="text-xl font-semibold mb-1 cursor-pointer hover:text-primary"
                              onClick={() => navigate(`/restaurant/${booking.restaurants.id}`)}
                            >
                              {booking.restaurants.name}
                            </h3>
                            <div className="flex items-center gap-2 text-muted-foreground text-sm">
                              <MapPin className="w-4 h-4" />
                              <span>{booking.restaurants.city}</span>
                            </div>
                          </div>
                          <Badge className={getStatusColor(booking.status)}>
                            <span className="flex items-center gap-1">
                              {getStatusIcon(booking.status)}
                              {getStatusText(booking.status)}
                            </span>
                          </Badge>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Calendar className="w-4 h-4" />
                            <span>{new Date(booking.booking_date).toLocaleDateString('it-IT', {
                              weekday: 'short',
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric'
                            })}</span>
                          </div>
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Clock className="w-4 h-4" />
                            <span>{booking.booking_time}</span>
                          </div>
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Users className="w-4 h-4" />
                            <span>{booking.guests_count} {booking.guests_count === 1 ? 'ospite' : 'ospiti'}</span>
                          </div>
                        </div>

                        {booking.special_requests && (
                          <div className="p-3 bg-muted rounded-lg">
                            <p className="text-sm font-medium mb-1">Richieste speciali:</p>
                            <p className="text-sm text-muted-foreground">{booking.special_requests}</p>
                          </div>
                        )}

                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => navigate(`/restaurant/${booking.restaurants.id}`)}
                          >
                            Vedi Ristorante
                          </Button>
                          
                          {(booking.status === "pending" || booking.status === "confirmed") && (
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="destructive" size="sm">
                                  <XCircle className="w-4 h-4 mr-2" />
                                  Annulla
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Annullare la prenotazione?</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    {booking.status === "confirmed" ? (
                                      <>
                                        <p className="font-semibold text-yellow-600 mb-2">⚠️ Attenzione!</p>
                                        <p>Annullando questa prenotazione confermata a meno di 48 ore dall'orario prenotato, perderai dei punti fedeltà.</p>
                                        <p className="mt-2">Sei sicuro di voler procedere?</p>
                                      </>
                                    ) : (
                                      "Sei sicuro di voler annullare questa prenotazione? Questa azione non può essere annullata."
                                    )}
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Indietro</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => cancelBooking(booking.id, booking.status)}
                                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                  >
                                    Annulla Prenotazione
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          )}
                        </div>
                      </div>
                    </div>
                  </Card>
                ))
              )}
            </TabsContent>

            <TabsContent value="past" className="space-y-4">
              {pastBookings.length === 0 ? (
                <Card className="p-12 text-center">
                  <Calendar className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-2">Nessuna prenotazione passata</h3>
                  <p className="text-muted-foreground">
                    Non hai ancora prenotazioni completate o annullate
                  </p>
                </Card>
              ) : (
                pastBookings.map((booking) => (
                  <Card key={booking.id} className="p-6 opacity-90">
                    <div className="flex flex-col md:flex-row gap-6">
                      <div
                        className="w-full md:w-48 h-32 rounded-lg bg-cover bg-center flex-shrink-0"
                        style={{
                          backgroundImage: `url(${
                            booking.restaurants.cover_image_url ||
                            booking.restaurants.logo_url ||
                            "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400&q=80"
                          })`
                        }}
                      />

                      <div className="flex-1 space-y-4">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3
                              className="text-xl font-semibold mb-1 cursor-pointer hover:text-primary"
                              onClick={() => navigate(`/restaurant/${booking.restaurants.id}`)}
                            >
                              {booking.restaurants.name}
                            </h3>
                            <div className="flex items-center gap-2 text-muted-foreground text-sm">
                              <MapPin className="w-4 h-4" />
                              <span>{booking.restaurants.city}</span>
                            </div>
                          </div>
                          <Badge className={getStatusColor(booking.status)}>
                            <span className="flex items-center gap-1">
                              {getStatusIcon(booking.status)}
                              {getStatusText(booking.status)}
                            </span>
                          </Badge>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Calendar className="w-4 h-4" />
                            <span>{new Date(booking.booking_date).toLocaleDateString('it-IT', {
                              weekday: 'short',
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric'
                            })}</span>
                          </div>
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Clock className="w-4 h-4" />
                            <span>{booking.booking_time}</span>
                          </div>
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Users className="w-4 h-4" />
                            <span>{booking.guests_count} {booking.guests_count === 1 ? 'ospite' : 'ospiti'}</span>
                          </div>
                        </div>

                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => navigate(`/restaurant/${booking.restaurants.id}`)}
                          >
                            Vedi Ristorante
                          </Button>
                          
                          {booking.status === "completed" && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => navigate(`/restaurant/${booking.restaurants.id}?tab=reviews`)}
                            >
                              Lascia una Recensione
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </Card>
                ))
              )}
            </TabsContent>
          </Tabs>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default MyBookings;
