import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Users, Clock, Heart, AlertCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { useLanguage } from "@/contexts/LanguageContext";
import { useFavorites } from "@/hooks/useFavorites";

interface BookingWidgetProps {
  restaurantId: string;
  restaurantName: string;
  openingHours?: any;
}

interface TimeSlot {
  time: string;
  available: boolean;
  period: 'lunch' | 'dinner';
}

interface DaySchedule {
  open?: boolean;
  isOpen?: boolean;
  openTime?: string;
  closeTime?: string;
  breakStart?: string;
  breakEnd?: string;
  hasBreak?: boolean;
}

const dayKeyMap: Record<number, string> = {
  0: "sunday",
  1: "monday",
  2: "tuesday",
  3: "wednesday",
  4: "thursday",
  5: "friday",
  6: "saturday",
};

export const BookingWidget = ({ restaurantId, restaurantName, openingHours }: BookingWidgetProps) => {
  const { user, profile } = useAuth();
  const { t } = useLanguage();
  const { favorites, toggleFavorite } = useFavorites();
  const [loading, setLoading] = useState(false);
  const [checkingSlots, setCheckingSlots] = useState(false);
  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([]);
  const [formData, setFormData] = useState({
    date: "",
    time: "",
    guests: 2,
    specialRequests: "",
    marketingConsent: false,
  });

  const isFavorite = favorites.includes(restaurantId);
  const guestOptions = [1, 2, 3, 4, 5, 6, 7, 8];

  // Generate time slots based on opening hours
  const generateTimeSlots = (date: string): string[] => {
    if (!openingHours || typeof openingHours !== 'object') {
      // Fallback to default slots if no opening hours configured
      return ["12:00", "12:30", "13:00", "13:30", "19:00", "19:30", "20:00", "20:30", "21:00", "21:30"];
    }

    const selectedDate = new Date(date);
    const dayOfWeek = selectedDate.getDay();
    const dayKey = dayKeyMap[dayOfWeek];
    const daySchedule: DaySchedule = openingHours[dayKey];

    if (!daySchedule) {
      return [];
    }

    // Check if open using either 'open' or 'isOpen' property
    const isOpen = daySchedule.open ?? daySchedule.isOpen ?? false;
    if (!isOpen) {
      return [];
    }

    const slots: string[] = [];
    const openTime = daySchedule.openTime || "12:00";
    const closeTime = daySchedule.closeTime || "23:00";
    const hasBreak = daySchedule.hasBreak || false;
    const breakStart = daySchedule.breakStart || "15:00";
    const breakEnd = daySchedule.breakEnd || "19:00";

    // Parse times
    const parseTime = (timeStr: string): number => {
      const [hours, minutes] = timeStr.split(':').map(Number);
      return hours * 60 + minutes;
    };

    const formatTime = (minutes: number): string => {
      const hours = Math.floor(minutes / 60);
      const mins = minutes % 60;
      return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
    };

    const openMinutes = parseTime(openTime);
    // Stop 1 hour before closing to allow time for dining
    const closeMinutes = parseTime(closeTime) - 60;
    const breakStartMinutes = hasBreak ? parseTime(breakStart) : -1;
    const breakEndMinutes = hasBreak ? parseTime(breakEnd) : -1;

    // Generate slots every 30 minutes
    for (let time = openMinutes; time <= closeMinutes; time += 30) {
      // Skip slots during break time
      if (hasBreak && time >= breakStartMinutes && time < breakEndMinutes) {
        continue;
      }
      slots.push(formatTime(time));
    }

    return slots;
  };

  // Check if restaurant is closed on selected date
  const isClosedOnDate = useMemo(() => {
    if (!formData.date || !openingHours) return false;
    
    const selectedDate = new Date(formData.date);
    const dayOfWeek = selectedDate.getDay();
    const dayKey = dayKeyMap[dayOfWeek];
    const daySchedule: DaySchedule = openingHours[dayKey];
    
    if (!daySchedule) return true;
    return !(daySchedule.open ?? daySchedule.isOpen ?? false);
  }, [formData.date, openingHours]);

  // Get opening hours for selected date
  const selectedDateHours = useMemo(() => {
    if (!formData.date || !openingHours) return null;
    
    const selectedDate = new Date(formData.date);
    const dayOfWeek = selectedDate.getDay();
    const dayKey = dayKeyMap[dayOfWeek];
    const daySchedule: DaySchedule = openingHours[dayKey];
    
    if (!daySchedule) return null;
    const isOpen = daySchedule.open ?? daySchedule.isOpen ?? false;
    if (!isOpen) return null;
    
    return {
      openTime: daySchedule.openTime || "12:00",
      closeTime: daySchedule.closeTime || "23:00",
      hasBreak: daySchedule.hasBreak || false,
      breakStart: daySchedule.breakStart,
      breakEnd: daySchedule.breakEnd,
    };
  }, [formData.date, openingHours]);

  useEffect(() => {
    if (formData.date && !isClosedOnDate) {
      checkAvailableSlots();
    } else {
      setAvailableSlots([]);
    }
  }, [formData.date, formData.guests, isClosedOnDate]);

  const checkAvailableSlots = async () => {
    setCheckingSlots(true);
    const dynamicSlots = generateTimeSlots(formData.date);
    const slots: TimeSlot[] = [];
    
    for (const time of dynamicSlots) {
      try {
        const { data: isAvailable } = await supabase.rpc("check_booking_availability", {
          _restaurant_id: restaurantId,
          _booking_date: formData.date,
          _booking_time: time,
          _guests_count: formData.guests,
        });
        
        const hour = parseInt(time.split(':')[0]);
        const period = hour < 16 ? 'lunch' : 'dinner';
        
        slots.push({ time, available: !!isAvailable, period });
      } catch (error) {
        const hour = parseInt(time.split(':')[0]);
        slots.push({ time, available: false, period: hour < 16 ? 'lunch' : 'dinner' });
      }
    }
    
    setAvailableSlots(slots);
    setCheckingSlots(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user || !profile) {
      toast.error(t("booking.pleaseLoginToBook"));
      return;
    }

    if (!formData.time) {
      toast.error("Seleziona un orario disponibile");
      return;
    }

    setLoading(true);

    try {
      const { data: isAvailable } = await supabase.rpc("check_booking_availability", {
        _restaurant_id: restaurantId,
        _booking_date: formData.date,
        _booking_time: formData.time,
        _guests_count: formData.guests,
      });

      if (!isAvailable) {
        toast.error(t("booking.noTablesAvailable"));
        setLoading(false);
        return;
      }

      const { error: bookingError } = await supabase
        .from("bookings")
        .insert({
          restaurant_id: restaurantId,
          user_id: user.id,
          user_name: profile.name,
          user_email: profile.email,
          user_phone: profile.phone,
          booking_date: formData.date,
          booking_time: formData.time,
          guests_count: formData.guests,
          special_requests: formData.specialRequests || null,
          status: "pending",
          marketing_consent: formData.marketingConsent,
        });

      if (bookingError) throw bookingError;

      try {
        await supabase.functions.invoke("send-booking-pending", {
          body: {
            userEmail: profile.email,
            userName: profile.name,
            restaurantName,
            bookingDate: formData.date,
            bookingTime: formData.time,
            guestsCount: formData.guests,
            specialRequests: formData.specialRequests,
          },
        });
      } catch (emailError) {
        console.error("Error sending pending email:", emailError);
      }

      toast.success("Richiesta di prenotazione inviata!");
      setFormData({ date: "", time: "", guests: 2, specialRequests: "", marketingConsent: false });
      setAvailableSlots([]);
    } catch (error: any) {
      console.error("Booking error:", error);
      toast.error(t("booking.bookingError"));
    } finally {
      setLoading(false);
    }
  };

  const minDate = new Date().toISOString().split("T")[0];
  
  const lunchSlots = availableSlots.filter(s => s.period === 'lunch');
  const dinnerSlots = availableSlots.filter(s => s.period === 'dinner');

  return (
    <Card className="shadow-xl border-2">
      <CardHeader className="pb-4">
        <CardTitle className="text-xl flex items-center gap-2">
          <Calendar className="w-5 h-5 text-primary" />
          Prenota un tavolo
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Data */}
          <div>
            <Label htmlFor="date" className="text-sm font-medium text-foreground mb-2 flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <Calendar className="w-4 h-4 text-primary" />
              </div>
              Data
            </Label>
            <div className="relative">
              <Input
                id="date"
                type="date"
                min={minDate}
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value, time: "" })}
                required
                className="h-12 pl-4 pr-4 rounded-xl border-2 border-border/60 bg-background hover:border-primary/40 focus:border-primary transition-colors text-base font-medium"
              />
            </div>
          </div>

          {/* Closed warning */}
          {formData.date && isClosedOnDate && (
            <div className="flex items-center gap-2 p-3 bg-destructive/10 text-destructive rounded-lg text-sm">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>Il ristorante è chiuso in questa data. Seleziona un altro giorno.</span>
            </div>
          )}

          {/* Opening hours info */}
          {formData.date && selectedDateHours && (
            <div className="p-3 bg-muted/50 rounded-lg text-sm">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Clock className="w-4 h-4" />
                <span>
                  Aperto: {selectedDateHours.openTime} - {selectedDateHours.closeTime}
                  {selectedDateHours.hasBreak && (
                    <span className="text-xs ml-2">
                      (pausa {selectedDateHours.breakStart}-{selectedDateHours.breakEnd})
                    </span>
                  )}
                </span>
              </div>
            </div>
          )}

          {/* Numero Ospiti */}
          <div>
            <Label className="text-sm font-medium text-foreground mb-2 flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <Users className="w-4 h-4 text-primary" />
              </div>
              Ospiti
            </Label>
            <div className="grid grid-cols-4 gap-2">
              {guestOptions.map((num) => (
                <button
                  key={num}
                  type="button"
                  onClick={() => setFormData({ ...formData, guests: num })}
                  className={`
                    h-12 rounded-xl border-2 font-semibold text-base transition-all duration-200
                    ${formData.guests === num 
                      ? 'bg-primary text-primary-foreground border-primary shadow-md scale-105' 
                      : 'bg-background border-border/60 text-foreground hover:border-primary/40 hover:bg-muted/50'
                    }
                  `}
                >
                  {num}
                </button>
              ))}
            </div>
          </div>

          {/* Time Slots */}
          {formData.date && !isClosedOnDate && (
            <div className="space-y-3">
              {checkingSlots ? (
                <div className="text-center py-4 text-sm text-muted-foreground">
                  <Clock className="w-4 h-4 animate-spin inline-block mr-2" />
                  Controllo disponibilità...
                </div>
              ) : (
                <>
                  {/* Lunch slots */}
                  {lunchSlots.length > 0 && (
                    <div>
                      <Label className="text-sm text-muted-foreground mb-1.5 block">🌞 Pranzo</Label>
                      <div className="grid grid-cols-3 gap-1.5">
                        {lunchSlots.map((slot) => (
                          <Button
                            key={slot.time}
                            type="button"
                            size="sm"
                            variant={formData.time === slot.time ? "default" : "outline"}
                            onClick={() => slot.available && setFormData({ ...formData, time: slot.time })}
                            disabled={!slot.available}
                            className={`h-9 ${!slot.available ? 'opacity-50 line-through' : ''}`}
                          >
                            {slot.time}
                          </Button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Dinner slots */}
                  {dinnerSlots.length > 0 && (
                    <div>
                      <Label className="text-sm text-muted-foreground mb-1.5 block">🌙 Cena</Label>
                      <div className="grid grid-cols-3 gap-1.5">
                        {dinnerSlots.map((slot) => (
                          <Button
                            key={slot.time}
                            type="button"
                            size="sm"
                            variant={formData.time === slot.time ? "default" : "outline"}
                            onClick={() => slot.available && setFormData({ ...formData, time: slot.time })}
                            disabled={!slot.available}
                            className={`h-9 ${!slot.available ? 'opacity-50 line-through' : ''}`}
                          >
                            {slot.time}
                          </Button>
                        ))}
                      </div>
                    </div>
                  )}

                  {lunchSlots.length === 0 && dinnerSlots.length === 0 && (
                    <div className="text-center py-4 text-sm text-muted-foreground">
                      Nessuno slot disponibile per questa data
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          <Button 
            type="submit" 
            className="w-full h-11" 
            disabled={loading || !formData.date || !formData.time || isClosedOnDate}
          >
            {loading ? "Invio..." : "Prenota ora"}
          </Button>
        </form>

        {/* Save button */}
        <div className="mt-4 pt-4 border-t">
          <p className="text-sm font-medium mb-2">Salva questo ristorante</p>
          <Button 
            variant="outline" 
            className="w-full gap-2"
            onClick={() => toggleFavorite(restaurantId)}
          >
            <Heart className={`w-4 h-4 ${isFavorite ? 'fill-red-500 text-red-500' : ''}`} />
            {isFavorite ? 'Salvato' : 'Salva'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
