import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Users, Clock, Heart } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { useLanguage } from "@/contexts/LanguageContext";
import { Badge } from "@/components/ui/badge";
import { useFavorites } from "@/hooks/useFavorites";

interface BookingWidgetProps {
  restaurantId: string;
  restaurantName: string;
}

interface TimeSlot {
  time: string;
  available: boolean;
}

export const BookingWidget = ({ restaurantId, restaurantName }: BookingWidgetProps) => {
  const { user, profile } = useAuth();
  const { t } = useLanguage();
  const { favorites, toggleFavorite } = useFavorites();
  const [loading, setLoading] = useState(false);
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
  const timeSlots = ["12:00", "12:30", "13:00", "13:30", "19:00", "19:30", "20:00", "20:30", "21:00", "21:30"];

  useEffect(() => {
    if (formData.date) {
      checkAvailableSlots();
    }
  }, [formData.date, formData.guests]);

  const checkAvailableSlots = async () => {
    const slots: TimeSlot[] = [];
    
    for (const time of timeSlots) {
      try {
        const { data: isAvailable } = await supabase.rpc("check_booking_availability", {
          _restaurant_id: restaurantId,
          _booking_date: formData.date,
          _booking_time: time,
          _guests_count: formData.guests,
        });
        
        slots.push({ time, available: !!isAvailable });
      } catch (error) {
        slots.push({ time, available: false });
      }
    }
    
    setAvailableSlots(slots);
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
    } catch (error: any) {
      console.error("Booking error:", error);
      toast.error(t("booking.bookingError"));
    } finally {
      setLoading(false);
    }
  };

  const minDate = new Date().toISOString().split("T")[0];

  return (
    <Card className="sticky top-24 shadow-xl border-2">
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
            <Label htmlFor="date" className="text-sm text-muted-foreground mb-1.5 flex items-center gap-1.5">
              <Calendar className="w-4 h-4" />
              Data
            </Label>
            <Input
              id="date"
              type="date"
              min={minDate}
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value, time: "" })}
              required
              className="h-11"
            />
          </div>

          {/* Orario */}
          <div>
            <Label className="text-sm text-muted-foreground mb-1.5 flex items-center gap-1.5">
              <Clock className="w-4 h-4" />
              Orario
            </Label>
            <Input
              type="time"
              value={formData.time}
              onChange={(e) => setFormData({ ...formData, time: e.target.value })}
              required
              className="h-11"
            />
          </div>

          {/* Numero Ospiti */}
          <div>
            <Label className="text-sm text-muted-foreground mb-1.5 flex items-center gap-1.5">
              <Users className="w-4 h-4" />
              Ospiti
            </Label>
            <div className="grid grid-cols-4 gap-1.5">
              {guestOptions.slice(0, 4).map((num) => (
                <Button
                  key={num}
                  type="button"
                  size="sm"
                  variant={formData.guests === num ? "default" : "outline"}
                  onClick={() => setFormData({ ...formData, guests: num })}
                  className="h-9"
                >
                  {num}
                </Button>
              ))}
            </div>
            <div className="grid grid-cols-4 gap-1.5 mt-1.5">
              {guestOptions.slice(4).map((num) => (
                <Button
                  key={num}
                  type="button"
                  size="sm"
                  variant={formData.guests === num ? "default" : "outline"}
                  onClick={() => setFormData({ ...formData, guests: num })}
                  className="h-9"
                >
                  {num}
                </Button>
              ))}
            </div>
          </div>

          {/* Slot Disponibili */}
          {formData.date && availableSlots.length > 0 && (
            <div>
              <Label className="text-sm text-muted-foreground mb-1.5">Slot Disponibili</Label>
              <div className="grid grid-cols-3 gap-1.5">
                {availableSlots.filter(s => s.available).slice(0, 6).map((slot) => (
                  <Button
                    key={slot.time}
                    type="button"
                    size="sm"
                    variant={formData.time === slot.time ? "default" : "outline"}
                    onClick={() => setFormData({ ...formData, time: slot.time })}
                    className="h-9"
                  >
                    {slot.time}
                  </Button>
                ))}
              </div>
            </div>
          )}

          <Button type="submit" className="w-full h-11" disabled={loading || !formData.date || !formData.time}>
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
