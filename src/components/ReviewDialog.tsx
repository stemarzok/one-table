import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Star } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { useLanguage } from "@/contexts/LanguageContext";

interface ReviewDialogProps {
  restaurantId: string;
  bookingId?: string;
  onReviewSubmitted?: () => void;
}

export const ReviewDialog = ({ restaurantId, bookingId, onReviewSubmitted }: ReviewDialogProps) => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    rating: 0,
    foodRating: 0,
    serviceRating: 0,
    ambianceRating: 0,
    comment: "",
  });

  const StarRating = ({ value, onChange, label }: { value: number; onChange: (value: number) => void; label: string }) => (
    <div className="space-y-2">
      <Label>{label}</Label>
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => onChange(star)}
            className="focus:outline-none"
          >
            <Star
              className={`h-6 w-6 ${
                star <= value ? "fill-primary text-primary" : "text-muted-foreground"
              }`}
            />
          </button>
        ))}
      </div>
    </div>
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      toast.error(t("review.pleaseLoginToReview"));
      return;
    }

    if (formData.rating === 0) {
      toast.error(t("review.pleaseSelectRating"));
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase.from("reviews").insert({
        restaurant_id: restaurantId,
        user_id: user.id,
        booking_id: bookingId || null,
        rating: formData.rating,
        food_rating: formData.foodRating || null,
        service_rating: formData.serviceRating || null,
        ambiance_rating: formData.ambianceRating || null,
        comment: formData.comment || null,
      });

      if (error) throw error;

      toast.success(t("review.reviewSubmitted"));
      setOpen(false);
      setFormData({
        rating: 0,
        foodRating: 0,
        serviceRating: 0,
        ambianceRating: 0,
        comment: "",
      });
      onReviewSubmitted?.();
    } catch (error: any) {
      console.error("Review error:", error);
      toast.error(t("review.reviewError"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">{t("review.writeReview")}</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t("review.writeReview")}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <StarRating
            value={formData.rating}
            onChange={(value) => setFormData({ ...formData, rating: value })}
            label={t("review.overallRating")}
          />
          <StarRating
            value={formData.foodRating}
            onChange={(value) => setFormData({ ...formData, foodRating: value })}
            label={t("review.foodQuality")}
          />
          <StarRating
            value={formData.serviceRating}
            onChange={(value) => setFormData({ ...formData, serviceRating: value })}
            label={t("review.serviceQuality")}
          />
          <StarRating
            value={formData.ambianceRating}
            onChange={(value) => setFormData({ ...formData, ambianceRating: value })}
            label={t("review.ambiance")}
          />
          <div>
            <Label htmlFor="comment">{t("review.yourReview")}</Label>
            <Textarea
              id="comment"
              value={formData.comment}
              onChange={(e) => setFormData({ ...formData, comment: e.target.value })}
              placeholder={t("review.reviewPlaceholder")}
              rows={4}
            />
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? t("review.submitting") : t("review.submitReview")}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};
