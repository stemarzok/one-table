import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { useLanguage } from "@/contexts/LanguageContext";

interface BookingDialogProps {
  restaurantId: string;
  restaurantName: string;
}

export const BookingDialog = ({ restaurantId, restaurantName }: BookingDialogProps) => {
  const { user, profile } = useAuth();
  const { t } = useLanguage();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    date: "",
    time: "",
    guests: 2,
    specialRequests: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user || !profile) {
      toast.error(t("booking.pleaseLoginToBook"));
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
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t("booking.bookTable")}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="date">{t("booking.date")}</Label>
            <Input
              id="date"
              type="date"
              min={minDate}
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              required
            />
          </div>
          <div>
            <Label htmlFor="time">{t("booking.time")}</Label>
            <Input
              id="time"
              type="time"
              value={formData.time}
              onChange={(e) => setFormData({ ...formData, time: e.target.value })}
              required
            />
          </div>
          <div>
            <Label htmlFor="guests">{t("booking.numberOfGuests")}</Label>
            <Input
              id="guests"
              type="number"
              min="1"
              max="20"
              value={formData.guests}
              onChange={(e) => setFormData({ ...formData, guests: parseInt(e.target.value) })}
              required
            />
          </div>
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
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? t("booking.confirming") : t("booking.confirmBooking")}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};
