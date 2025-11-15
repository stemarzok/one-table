import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Star } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

interface Review {
  id: string;
  rating: number;
  food_rating: number | null;
  service_rating: number | null;
  ambiance_rating: number | null;
  comment: string | null;
  created_at: string;
  profiles: {
    name: string;
    avatar_url: string | null;
  };
}

interface ReviewsListProps {
  restaurantId: string;
}

export const ReviewsList = ({ restaurantId }: ReviewsListProps) => {
  const { t } = useLanguage();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReviews();
  }, [restaurantId]);

  const fetchReviews = async () => {
    try {
      // First get reviews
      const { data: reviewsData, error: reviewsError } = await supabase
        .from("reviews")
        .select("*")
        .eq("restaurant_id", restaurantId)
        .order("created_at", { ascending: false })
        .limit(10);

      if (reviewsError) throw reviewsError;

      // Then get profile info for each review
      const reviewsWithProfiles = await Promise.all(
        (reviewsData || []).map(async (review) => {
          const { data: profile } = await supabase
            .from("profiles")
            .select("name, avatar_url")
            .eq("id", review.user_id)
            .single();

          return {
            ...review,
            profiles: profile || { name: "User", avatar_url: null },
          };
        })
      );

      const { data, error } = { data: reviewsWithProfiles, error: null };

      if (error) throw error;
      setReviews(data || []);
    } catch (error) {
      console.error("Error fetching reviews:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center py-8">{t("review.loading")}</div>;
  }

  if (reviews.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        {t("review.noReviewsYet")}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {reviews.map((review) => (
        <Card key={review.id} className="p-6">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="text-sm font-semibold text-primary">
                  {review.profiles.name.charAt(0).toUpperCase()}
                </span>
              </div>
            </div>
            <div className="flex-1 space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="font-semibold">{review.profiles.name}</h4>
                <span className="text-sm text-muted-foreground">
                  {new Date(review.created_at).toLocaleDateString('it-IT')}
                </span>
              </div>
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`h-4 w-4 ${
                      star <= review.rating
                        ? "fill-primary text-primary"
                        : "text-muted-foreground"
                    }`}
                  />
                ))}
              </div>
              {(review.food_rating || review.service_rating || review.ambiance_rating) && (
                <div className="flex gap-4 text-sm text-muted-foreground">
                  {review.food_rating && (
                    <span>{t("review.food")}: {review.food_rating}/5</span>
                  )}
                  {review.service_rating && (
                    <span>{t("review.service")}: {review.service_rating}/5</span>
                  )}
                  {review.ambiance_rating && (
                    <span>{t("review.ambiance")}: {review.ambiance_rating}/5</span>
                  )}
                </div>
              )}
              {review.comment && (
                <p className="text-muted-foreground">{review.comment}</p>
              )}
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
};
