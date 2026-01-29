import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Clock, CheckCircle, XCircle, Calendar, Check, X, Shield, Star, TrendingUp, Users } from "lucide-react";
import { toast } from "sonner";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface RecentActivityProps {
  restaurantId: string;
  hasProAccess: boolean;
  onViewAll: () => void;
}

interface Booking {
  id: string;
  user_id: string;
  user_name: string;
  booking_date: string;
  booking_time: string;
  guests_count: number;
  status: string;
  created_at: string;
}

interface UserProfile {
  id: string;
  name: string;
  avatar_url: string | null;
  level: string;
  points: number;
}

// Helper function to calculate reliability score based on points/level
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

export const RecentActivity = ({ restaurantId, hasProAccess, onViewAll }: RecentActivityProps) => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [userProfiles, setUserProfiles] = useState<Record<string, UserProfile>>({});
  const [loading, setLoading] = useState(true);

  const fetchBookings = async () => {
    const { data } = await supabase
      .from("bookings")
      .select("id, user_id, user_name, booking_date, booking_time, guests_count, status, created_at")
      .eq("restaurant_id", restaurantId)
      .order("created_at", { ascending: false })
      .limit(5);

    if (data) {
      setBookings(data);
      
      // Fetch user profiles for all bookings
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

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  if (loading) {
    return (
      <Card className="overflow-hidden border-0 shadow-lg bg-gradient-to-br from-card to-card/80">
        <div className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-5 bg-muted rounded w-1/3" />
            <div className="h-20 bg-muted rounded-xl" />
            <div className="h-20 bg-muted rounded-xl" />
            <div className="h-20 bg-muted rounded-xl" />
          </div>
        </div>
      </Card>
    );
  }

  if (bookings.length === 0) {
    return (
      <Card className="overflow-hidden border-0 shadow-lg bg-gradient-to-br from-card to-card/80">
        <div className="p-8">
          <div className="text-center py-8">
            <div className="w-16 h-16 rounded-2xl bg-muted/50 flex items-center justify-center mx-auto mb-4">
              <Calendar className="w-8 h-8 text-muted-foreground" />
            </div>
            <p className="text-muted-foreground font-medium">Nessuna prenotazione recente</p>
            <p className="text-sm text-muted-foreground/70 mt-1">Le nuove prenotazioni appariranno qui</p>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden border-0 shadow-lg bg-gradient-to-br from-card to-card/80">
      <div className="p-5 border-b bg-gradient-to-r from-muted/30 to-transparent">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-primary/10">
              <Users className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-lg">Attività Recenti</h3>
              <p className="text-xs text-muted-foreground">Ultime 5 prenotazioni</p>
            </div>
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onViewAll} 
            className="text-primary hover:text-primary hover:bg-primary/10 font-medium gap-1.5 rounded-xl"
          >
            Vedi tutte
            <TrendingUp className="w-4 h-4" />
          </Button>
        </div>
      </div>
      <div className="divide-y divide-border/50">
        <TooltipProvider>
          {bookings.map((booking) => {
            const statusConfig = getStatusConfig(booking.status);
            const StatusIcon = statusConfig.icon;
            const userProfile = userProfiles[booking.user_id];
            const reliability = userProfile ? getReliabilityInfo(userProfile.level, userProfile.points) : null;
            const levelBadge = userProfile ? getLevelBadge(userProfile.level) : null;

            return (
              <div key={booking.id} className="p-4 hover:bg-muted/30 transition-all duration-200">
                <div className="flex items-center gap-4">
                  {/* Avatar con foto profilo */}
                  <div className="relative flex-shrink-0">
                    <Avatar className="w-12 h-12 ring-2 ring-background shadow-md">
                      <AvatarImage src={userProfile?.avatar_url || undefined} alt={booking.user_name} />
                      <AvatarFallback className="bg-gradient-to-br from-primary/20 to-primary/10 text-primary font-semibold">
                        {getInitials(booking.user_name)}
                      </AvatarFallback>
                    </Avatar>
                    {/* Level indicator dot */}
                    {levelBadge && (
                      <div className={`absolute -bottom-0.5 -right-0.5 w-5 h-5 rounded-full flex items-center justify-center ${levelBadge.bg} border-2 border-background`}>
                        <span className={levelBadge.text}>{levelBadge.icon}</span>
                      </div>
                    )}
                  </div>
                  
                  {/* Info principale */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-semibold truncate">{booking.user_name}</p>
                      {/* Level Badge */}
                      {userProfile && (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Badge 
                              variant="outline" 
                              className={`text-[10px] px-1.5 py-0 h-5 capitalize border-0 ${levelBadge?.bg} ${levelBadge?.text}`}
                            >
                              {userProfile.level}
                            </Badge>
                          </TooltipTrigger>
                          <TooltipContent side="top" className="text-xs">
                            <p className="font-medium">{userProfile.points} punti fedeltà</p>
                          </TooltipContent>
                        </Tooltip>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <span className="font-medium">{formatDate(booking.booking_date)}</span>
                      <span className="text-muted-foreground/50">•</span>
                      <span>{formatTime(booking.booking_time)}</span>
                      <span className="text-muted-foreground/50">•</span>
                      <span>{booking.guests_count} ospiti</span>
                    </div>
                    
                    {/* Reliability indicator */}
                    {reliability && (
                      <div className="flex items-center gap-1.5 mt-1.5">
                        <div className="flex items-center gap-1">
                          <Shield className={`w-3 h-3 ${reliability.color}`} />
                          <span className={`text-xs font-medium ${reliability.color}`}>
                            {reliability.label}
                          </span>
                        </div>
                        <span className="text-xs text-muted-foreground">
                          • {reliability.score}% affidabilità
                        </span>
                      </div>
                    )}
                  </div>
                  
                  {/* Status e azioni */}
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <Badge variant="outline" className={`${statusConfig.className} font-medium`}>
                      <StatusIcon className="w-3 h-3 mr-1" />
                      {statusConfig.label}
                    </Badge>
                    {booking.status === "pending" && hasProAccess && (
                      <div className="flex gap-1 ml-1">
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8 rounded-xl bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground transition-all"
                          onClick={() => handleUpdateStatus(booking.id, "confirmed")}
                        >
                          <Check className="w-4 h-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8 rounded-xl bg-destructive/10 text-destructive hover:bg-destructive hover:text-destructive-foreground transition-all"
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
        </TooltipProvider>
      </div>
    </Card>
  );
};
