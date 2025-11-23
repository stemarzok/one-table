import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Star, MessageSquare } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

interface Review {
  id: string;
  rating: number;
  food_rating: number | null;
  service_rating: number | null;
  ambiance_rating: number | null;
  comment: string | null;
  photos: string[] | null;
  created_at: string;
  profiles: {
    name: string;
    avatar_url: string | null;
  };
  responses?: ReviewResponse[];
}

interface ReviewResponse {
  id: string;
  response: string;
  created_at: string;
  profiles: {
    name: string;
  };
}

interface ReviewsListProps {
  restaurantId: string;
}

export const ReviewsList = ({ restaurantId }: ReviewsListProps) => {
  const { t } = useLanguage();
  const { user } = useAuth();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [respondingTo, setRespondingTo] = useState<string | null>(null);
  const [responseText, setResponseText] = useState("");
  const [hasRole, setHasRole] = useState(false);

  // Check if user has role for this specific restaurant
  useEffect(() => {
    const checkRole = async () => {
      if (!user) return;
      const { data } = await supabase
        .from("business_roles")
        .select("id")
        .eq("user_id", user.id)
        .eq("restaurant_id", restaurantId)
        .single();
      setHasRole(!!data);
    };
    checkRole();
  }, [user, restaurantId]);

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

      // Then get profile info and responses for each review
      const reviewsWithProfiles = await Promise.all(
        (reviewsData || []).map(async (review) => {
          const { data: profile } = await supabase
            .from("profiles")
            .select("name, avatar_url")
            .eq("id", review.user_id)
            .single();

          // Get responses for this review
          const { data: responsesData } = await supabase
            .from("review_responses")
            .select("id, response, created_at, user_id")
            .eq("review_id", review.id)
            .order("created_at", { ascending: true });

          // Get profiles for responses
          const responsesWithProfiles = await Promise.all(
            (responsesData || []).map(async (resp) => {
              const { data: respProfile } = await supabase
                .from("profiles")
                .select("name")
                .eq("id", resp.user_id)
                .single();
              
              return {
                ...resp,
                profiles: respProfile || { name: "Ristorante" },
              };
            })
          );

          return {
            ...review,
            profiles: profile || { name: "User", avatar_url: null },
            responses: responsesWithProfiles,
          };
        })
      );

      setReviews(reviewsWithProfiles || []);
    } catch (error) {
      console.error("Error fetching reviews:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitResponse = async (reviewId: string) => {
    if (!user || !responseText.trim()) return;

    try {
      const { error } = await supabase.from("review_responses").insert({
        review_id: reviewId,
        restaurant_id: restaurantId,
        user_id: user.id,
        response: responseText.trim(),
      });

      if (error) throw error;

      toast.success("Risposta pubblicata");
      setResponseText("");
      setRespondingTo(null);
      fetchReviews();
    } catch (error) {
      console.error("Error submitting response:", error);
      toast.error("Errore nella pubblicazione della risposta");
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
              
              {review.photos && review.photos.length > 0 && (
                <div className="grid grid-cols-3 gap-2 mt-3">
                  {review.photos.map((photo, idx) => (
                    <img
                      key={idx}
                      src={photo}
                      alt={`Foto ${idx + 1}`}
                      className="w-full aspect-square object-cover rounded-lg"
                    />
                  ))}
                </div>
              )}

              {review.responses && review.responses.length > 0 && (
                <div className="mt-4 space-y-3 pl-4 border-l-2 border-primary/20">
                  {review.responses.map((response) => (
                    <div key={response.id} className="space-y-1">
                      <div className="flex items-center gap-2">
                        <MessageSquare className="w-4 h-4 text-primary" />
                        <span className="font-semibold text-sm">{response.profiles.name}</span>
                        <span className="text-xs text-muted-foreground">
                          {new Date(response.created_at).toLocaleDateString('it-IT')}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground">{response.response}</p>
                    </div>
                  ))}
                </div>
              )}

              {hasRole && (
                <div className="mt-4">
                  {respondingTo === review.id ? (
                    <div className="space-y-2">
                      <Textarea
                        value={responseText}
                        onChange={(e) => setResponseText(e.target.value)}
                        placeholder="Scrivi una risposta..."
                        rows={3}
                      />
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => handleSubmitResponse(review.id)}
                        >
                          Pubblica
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setRespondingTo(null);
                            setResponseText("");
                          }}
                        >
                          Annulla
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setRespondingTo(review.id)}
                    >
                      <MessageSquare className="w-4 h-4 mr-2" />
                      Rispondi
                    </Button>
                  )}
                </div>
              )}
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
};
