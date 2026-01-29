import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Calendar, Users, Clock, CheckCircle, XCircle, AlertCircle, Shield, Star, Filter, Table2 } from "lucide-react";
import { toast } from "sonner";
import { useLanguage } from "@/contexts/LanguageContext";

interface Booking {
  id: string;
  user_id: string;
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

interface UserProfile {
  id: string;
  name: string;
  avatar_url: string | null;
  level: string;
  points: number;
}

interface BookingsManagementProps {
  restaurantId: string;
}

const getReliabilityInfo = (level: string, points: number) => {
  const levelScores: Record<string, { score: number; color: string; label: string }> = {
    'platinum': { score: 98, color: 'text-primary', label: 'Eccellente' },
    'gold': { score: 90, color: 'text-amber-500', label: 'Ottimo' },
    'silver': { score: 75, color: 'text-slate-400', label: 'Buono' },
    'bronze': { score: 60, color: 'text-orange-600', label: 'Nuovo' },
  };
  return levelScores[level.toLowerCase()] || levelScores['bronze'];
};

const getLevelBadge = (level: string) => {
  const levelConfig: Record<string, { bg: string; text: string; icon: React.ReactNode }> = {
    'platinum': { bg: 'bg-gradient-to-r from-primary/20 to-primary/10', text: 'text-primary', icon: <Star className="w-3 h-3" /> },
    'gold': { bg: 'bg-gradient-to-r from-amber-500/20 to-amber-500/10', text: 'text-amber-500', icon: <Star className="w-3 h-3" /> },
    'silver': { bg: 'bg-gradient-to-r from-slate-400/20 to-slate-400/10', text: 'text-slate-400', icon: <Shield className="w-3 h-3" /> },
    'bronze': { bg: 'bg-gradient-to-r from-orange-600/20 to-orange-600/10', text: 'text-orange-600', icon: <Shield className="w-3 h-3" /> },
  };
  return levelConfig[level.toLowerCase()] || levelConfig['bronze'];
};

export const BookingsManagement = ({ restaurantId }: BookingsManagementProps) => {
  const { t } = useLanguage();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [userProfiles, setUserProfiles] = useState<Record<string, UserProfile>>({});
  const [tables, setTables] = useState<Table[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("all");

  useEffect(() => {
    fetchBookings();
    fetchTables();
    
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
      
      if (data) {
        setBookings(data);
        
        // Fetch user profiles
        const userIds = [...new Set(data.map(b => b.user_id))];
        if (userIds.length > 0) {
          const { data: profiles } = await supabase
            .from("profiles")
            .select("id, name, avatar_url, level, points")
            .in("id", userIds);
          
          if (profiles) {
            const profileMap: Record<string, UserProfile> = {};
            profiles.forEach(p => {
              profileMap[p.id] = p;
            });
            setUserProfiles(profileMap);
          }
        }
      }
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
      const booking = bookings.find(b => b.id === bookingId);
      
      const { error } = await supabase
        .from("bookings")
        .update({ status })
        .eq("id", bookingId);

      if (error) throw error;
      
      if (status === "confirmed" && booking) {
        try {
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
        } catch (emailError) {
          console.error("Error sending confirmation email:", emailError);
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

  const getStatusConfig = (status: string) => {
    switch (status) {
      case "confirmed":
        return { label: "Confermata", icon: CheckCircle, className: "bg-primary/10 text-primary border-primary/20" };
      case "pending":
        return { label: "In attesa", icon: AlertCircle, className: "bg-amber-500/10 text-amber-600 border-amber-500/20" };
      case "cancelled":
        return { label: "Annullata", icon: XCircle, className: "bg-destructive/10 text-destructive border-destructive/20" };
      case "completed":
        return { label: "Completata", icon: CheckCircle, className: "bg-blue-500/10 text-blue-500 border-blue-500/20" };
      default:
        return { label: status, icon: Clock, className: "bg-muted text-muted-foreground" };
    }
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const filteredBookings = bookings.filter(booking => {
    if (filter === "all") return true;
    return booking.status === filter;
  });

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded-xl w-1/3" />
          <div className="h-32 bg-muted rounded-2xl" />
          <div className="h-32 bg-muted rounded-2xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">Gestione Prenotazioni</h2>
          <p className="text-sm text-muted-foreground mt-1">{filteredBookings.length} prenotazioni</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-muted/50 rounded-full">
            <Filter className="w-4 h-4 text-muted-foreground" />
            <Select value={filter} onValueChange={setFilter}>
              <SelectTrigger className="w-[140px] border-0 bg-transparent h-8 focus:ring-0">
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
        </div>
      </div>

      {filteredBookings.length === 0 ? (
        <Card className="p-12 text-center border-0 shadow-lg bg-gradient-to-br from-card to-card/80">
          <div className="w-16 h-16 rounded-2xl bg-muted/50 flex items-center justify-center mx-auto mb-4">
            <Calendar className="w-8 h-8 text-muted-foreground" />
          </div>
          <p className="text-xl font-medium text-muted-foreground">Nessuna prenotazione trovata</p>
          <p className="text-sm text-muted-foreground/70 mt-1">Le prenotazioni appariranno qui</p>
        </Card>
      ) : (
        <div className="space-y-4">
          <TooltipProvider>
            {filteredBookings.map((booking) => {
              const statusConfig = getStatusConfig(booking.status);
              const StatusIcon = statusConfig.icon;
              const userProfile = userProfiles[booking.user_id];
              const reliability = userProfile ? getReliabilityInfo(userProfile.level, userProfile.points) : null;
              const levelBadge = userProfile ? getLevelBadge(userProfile.level) : null;

              return (
                <Card key={booking.id} className="overflow-hidden border-0 shadow-lg bg-gradient-to-br from-card to-card/80 transition-all duration-300 hover:shadow-xl">
                  <div className="p-5">
                    <div className="flex flex-col lg:flex-row gap-5">
                      {/* Customer Profile Section */}
                      <div className="flex items-start gap-4 flex-1 min-w-0">
                        {/* Avatar */}
                        <div className="relative flex-shrink-0">
                          <Avatar className="w-14 h-14 ring-2 ring-background shadow-lg">
                            <AvatarImage src={userProfile?.avatar_url || undefined} alt={booking.user_name} />
                            <AvatarFallback className="bg-gradient-to-br from-primary/20 to-primary/10 text-primary font-semibold text-lg">
                              {getInitials(booking.user_name)}
                            </AvatarFallback>
                          </Avatar>
                          {levelBadge && (
                            <div className={`absolute -bottom-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center ${levelBadge.bg} border-2 border-background shadow-sm`}>
                              <span className={levelBadge.text}>{levelBadge.icon}</span>
                            </div>
                          )}
                        </div>

                        {/* Customer Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1 flex-wrap">
                            <h3 className="font-semibold text-lg truncate">{booking.user_name}</h3>
                            {userProfile && (
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Badge 
                                    variant="outline" 
                                    className={`text-xs px-2 py-0.5 capitalize border-0 ${levelBadge?.bg} ${levelBadge?.text} font-medium`}
                                  >
                                    {userProfile.level}
                                  </Badge>
                                </TooltipTrigger>
                                <TooltipContent side="top">
                                  <p className="font-medium">{userProfile.points} punti fedeltà</p>
                                </TooltipContent>
                              </Tooltip>
                            )}
                            <Badge variant="outline" className={`${statusConfig.className} font-medium`}>
                              <StatusIcon className="w-3 h-3 mr-1" />
                              {statusConfig.label}
                            </Badge>
                          </div>
                          
                          <p className="text-sm text-muted-foreground truncate">{booking.user_email}</p>
                          {booking.user_phone && (
                            <p className="text-sm text-muted-foreground">{booking.user_phone}</p>
                          )}
                          
                          {/* Reliability indicator */}
                          {reliability && (
                            <div className="flex items-center gap-2 mt-2">
                              <Shield className={`w-3.5 h-3.5 ${reliability.color}`} />
                              <span className={`text-xs font-medium ${reliability.color}`}>
                                {reliability.label}
                              </span>
                              <span className="text-xs text-muted-foreground">
                                • {reliability.score}% affidabilità
                              </span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Booking Details */}
                      <div className="flex flex-wrap gap-3 items-center lg:items-start">
                        <div className="flex items-center gap-2 px-3 py-2 bg-muted/50 rounded-xl">
                          <Calendar className="w-4 h-4 text-primary" />
                          <span className="text-sm font-medium">
                            {new Date(booking.booking_date).toLocaleDateString('it-IT', { day: 'numeric', month: 'short' })}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 px-3 py-2 bg-muted/50 rounded-xl">
                          <Clock className="w-4 h-4 text-primary" />
                          <span className="text-sm font-medium">{booking.booking_time.slice(0, 5)}</span>
                        </div>
                        <div className="flex items-center gap-2 px-3 py-2 bg-muted/50 rounded-xl">
                          <Users className="w-4 h-4 text-primary" />
                          <span className="text-sm font-medium">{booking.guests_count} ospiti</span>
                        </div>
                      </div>
                    </div>

                    {/* Special Requests & Table Assignment */}
                    <div className="mt-4 pt-4 border-t border-border/50 flex flex-col sm:flex-row gap-4">
                      {booking.special_requests && (
                        <div className="flex-1 p-3 bg-muted/30 rounded-xl">
                          <p className="text-xs font-medium text-muted-foreground mb-1">Richieste Speciali</p>
                          <p className="text-sm">{booking.special_requests}</p>
                        </div>
                      )}

                      <div className="flex items-center gap-3 flex-shrink-0">
                        <div className="flex items-center gap-2">
                          <Table2 className="w-4 h-4 text-muted-foreground" />
                          <Select
                            value={booking.table_id || ""}
                            onValueChange={(value) => assignTable(booking.id, value)}
                          >
                            <SelectTrigger className="w-[160px] h-9 rounded-xl border-border/50 bg-muted/30">
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
                        </div>

                        {/* Action Buttons */}
                        {booking.status === "pending" && (
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              onClick={() => updateBookingStatus(booking.id, "confirmed")}
                              className="h-9 px-4 rounded-xl bg-primary hover:bg-primary/90 shadow-md hover:shadow-lg transition-all"
                            >
                              <CheckCircle className="w-4 h-4 mr-1.5" />
                              Conferma
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => updateBookingStatus(booking.id, "cancelled")}
                              className="h-9 px-4 rounded-xl border-destructive/30 text-destructive hover:bg-destructive/10 hover:text-destructive"
                            >
                              <XCircle className="w-4 h-4 mr-1.5" />
                              Annulla
                            </Button>
                          </div>
                        )}

                        {booking.status === "confirmed" && (
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              onClick={() => updateBookingStatus(booking.id, "completed")}
                              className="h-9 px-4 rounded-xl shadow-md hover:shadow-lg transition-all"
                            >
                              Completa
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => updateBookingStatus(booking.id, "cancelled")}
                              className="h-9 px-4 rounded-xl text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                            >
                              Annulla
                            </Button>
                          </div>
                        )}

                        {booking.status === "cancelled" && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => updateBookingStatus(booking.id, "confirmed")}
                            className="h-9 px-4 rounded-xl"
                          >
                            <CheckCircle className="w-4 h-4 mr-1.5" />
                            Ripristina
                          </Button>
                        )}

                        {booking.status === "completed" && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => updateBookingStatus(booking.id, "cancelled")}
                            className="h-9 px-4 rounded-xl text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                          >
                            <XCircle className="w-4 h-4 mr-1.5" />
                            Annulla
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </Card>
              );
            })}
          </TooltipProvider>
        </div>
      )}
    </div>
  );
};
