import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Star, Upload, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { useLanguage } from "@/contexts/LanguageContext";
import { Input } from "@/components/ui/input";

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
  const [photos, setPhotos] = useState<File[]>([]);
  const [photoUrls, setPhotoUrls] = useState<string[]>([]);

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

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (photos.length + files.length > 5) {
      toast.error("Puoi caricare massimo 5 foto");
      return;
    }
    setPhotos([...photos, ...files]);
    files.forEach(file => {
      const url = URL.createObjectURL(file);
      setPhotoUrls(prev => [...prev, url]);
    });
  };

  const removePhoto = (index: number) => {
    URL.revokeObjectURL(photoUrls[index]);
    setPhotos(photos.filter((_, i) => i !== index));
    setPhotoUrls(photoUrls.filter((_, i) => i !== index));
  };

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
      // Upload photos if any
      const uploadedPhotoUrls: string[] = [];
      
      if (photos.length > 0) {
        for (const photo of photos) {
          const fileExt = photo.name.split('.').pop();
          const fileName = `${user.id}/${Math.random()}.${fileExt}`;
          
          const { error: uploadError, data } = await supabase.storage
            .from('restaurant-images')
            .upload(fileName, photo);

          if (uploadError) throw uploadError;
          
          const { data: { publicUrl } } = supabase.storage
            .from('restaurant-images')
            .getPublicUrl(fileName);
            
          uploadedPhotoUrls.push(publicUrl);
        }
      }

      const { error } = await supabase.from("reviews").insert({
        restaurant_id: restaurantId,
        user_id: user.id,
        booking_id: bookingId || null,
        rating: formData.rating,
        food_rating: formData.foodRating || null,
        service_rating: formData.serviceRating || null,
        ambiance_rating: formData.ambianceRating || null,
        comment: formData.comment || null,
        photos: uploadedPhotoUrls.length > 0 ? uploadedPhotoUrls : null,
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
      setPhotos([]);
      setPhotoUrls([]);
      onReviewSubmitted?.();
    } catch (error: any) {
      console.error("Review error:", error);
      console.error("Review error details:", error?.message, error?.code, error?.details);
      toast.error(error?.message || t("review.reviewError"));
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
          
          <div>
            <Label>Foto (max 5)</Label>
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handlePhotoChange}
                  className="hidden"
                  id="photo-upload"
                />
                <Label htmlFor="photo-upload" className="cursor-pointer">
                  <div className="flex items-center gap-2 px-4 py-2 border border-input rounded-md hover:bg-accent">
                    <Upload className="w-4 h-4" />
                    <span>Carica foto</span>
                  </div>
                </Label>
                <span className="text-sm text-muted-foreground">
                  {photos.length}/5 foto
                </span>
              </div>
              
              {photoUrls.length > 0 && (
                <div className="grid grid-cols-3 gap-2">
                  {photoUrls.map((url, index) => (
                    <div key={index} className="relative aspect-square">
                      <img
                        src={url}
                        alt={`Preview ${index + 1}`}
                        className="w-full h-full object-cover rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={() => removePhoto(index)}
                        className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full p-1"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? t("review.submitting") : t("review.submitReview")}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};
