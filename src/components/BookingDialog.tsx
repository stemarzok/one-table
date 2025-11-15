import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Calendar, Users, Clock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { useLanguage } from "@/contexts/LanguageContext";
import { Badge } from "@/components/ui/badge";

interface BookingDialogProps {
  restaurantId: string;
  restaurantName: string;
}

interface TimeSlot {
  time: string;
  available: boolean;
}

export const BookingDialog = ({ restaurantId, restaurantName }: BookingDialogProps) => {
  const { user, profile } = useAuth();
  const { t } = useLanguage();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([]);
  const [formData, setFormData] = useState({
    date: "",
    time: "",
    guests: 2,
    specialRequests: "",
  });

  const guestOptions = [1, 2, 3, 4, 5, 6, 7, 8];
  const timeSlots = ["18:00", "18:30", "19:00", "19:30", "20:00", "20:30", "21:00", "21:30", "22:00"];

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
      // Check availability
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

      // Create booking
      const { data: booking, error: bookingError } = await supabase
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
        })
        .select()
        .single();

      if (bookingError) throw bookingError;

      // Send confirmation email
      try {
        await supabase.functions.invoke("send-booking-confirmation", {
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
        console.error("Error sending confirmation email:", emailError);
        // Don't fail the booking if email fails
      }

      toast.success(t("booking.bookingConfirmed"));
      setOpen(false);
      setFormData({ date: "", time: "", guests: 2, specialRequests: "" });
    } catch (error: any) {
      console.error("Booking error:", error);
      toast.error(t("booking.bookingError"));
    } finally {
      setLoading(false);
    }
  };

  const minDate = new Date().toISOString().split("T")[0];

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="lg" className="gap-2">
          <Calendar className="h-5 w-5" />
          {t("booking.bookTable")}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl">{t("booking.bookTable")}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Numero Commensali */}
          <div>
            <Label className="flex items-center gap-2 text-base mb-3">
              <Users className="w-5 h-5" />
              {t("booking.numberOfGuests")}
            </Label>
            <div className="grid grid-cols-4 gap-2">
              {guestOptions.map((num) => (
                <Button
                  key={num}
                  type="button"
                  variant={formData.guests === num ? "default" : "outline"}
                  onClick={() => setFormData({ ...formData, guests: num })}
                  className="h-12"
                >
                  {num} {num === 1 ? 'persona' : 'persone'}
                </Button>
              ))}
            </div>
          </div>

          {/* Data */}
          <div>
            <Label htmlFor="date" className="flex items-center gap-2 text-base mb-3">
              <Calendar className="w-5 h-5" />
              {t("booking.date")}
            </Label>
            <Input
              id="date"
              type="date"
              min={minDate}
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value, time: "" })}
              required
              className="h-12 text-base"
            />
          </div>

          {/* Orari Disponibili */}
          {formData.date && (
            <div>
              <Label className="flex items-center gap-2 text-base mb-3">
                <Clock className="w-5 h-5" />
                Slot Disponibili
              </Label>
              <div className="grid grid-cols-3 gap-2">
                {availableSlots.map((slot) => (
                  <Button
                    key={slot.time}
                    type="button"
                    variant={formData.time === slot.time ? "default" : "outline"}
                    onClick={() => slot.available && setFormData({ ...formData, time: slot.time })}
                    disabled={!slot.available}
                    className="h-12 relative"
                  >
                    {slot.time}
                    {!slot.available && (
                      <Badge 
                        variant="destructive" 
                        className="absolute -top-1 -right-1 text-xs px-1"
                      >
                        Full
                      </Badge>
                    )}
                  </Button>
                ))}
              </div>
            </div>
          )}

          {/* Richieste Speciali */}
          <div>
            <Label htmlFor="requests">{t("booking.specialRequests")}</Label>
            <Textarea
              id="requests"
              value={formData.specialRequests}
              onChange={(e) => setFormData({ ...formData, specialRequests: e.target.value })}
              placeholder={t("booking.specialRequestsPlaceholder")}
              rows={3}
            />
          </div>

          <Button type="submit" className="w-full h-12 text-base" disabled={loading || !formData.time}>
            {loading ? t("booking.confirming") : t("booking.confirmBooking")}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};
