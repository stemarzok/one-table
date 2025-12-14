import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star, MessageSquare, Flag, AlertTriangle } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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
    level: string;
  };
  responses?: ReviewResponse[];
  is_reported?: boolean;
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
  const [reportDialogOpen, setReportDialogOpen] = useState(false);
  const [reportingReview, setReportingReview] = useState<string | null>(null);
  const [reportReason, setReportReason] = useState("");
  const [reportedReviews, setReportedReviews] = useState<Set<string>>(new Set());

  // Check if user has role for this specific restaurant
  useEffect(() => {
    const checkRole = async () => {
      if (!user) return;
      const { data } = await supabase
        .from("business_roles")
        .select("id")
        .eq("user_id", user.id)
        .eq("restaurant_id", restaurantId)
        .maybeSingle();
      setHasRole(!!data);

      // If has role, check which reviews are already reported
      if (data) {
        const { data: reports } = await supabase
          .from("review_reports")
          .select("review_id")
          .eq("restaurant_id", restaurantId);
        
        if (reports) {
          setReportedReviews(new Set(reports.map(r => r.review_id)));
        }
      }
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
            .select("name, avatar_url, level")
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
            profiles: profile || { name: "User", avatar_url: null, level: "Bronze" },
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

  const handleReportReview = async () => {
    if (!user || !reportingReview || !reportReason) return;

    try {
      const { error } = await supabase.from("review_reports").insert({
        review_id: reportingReview,
        restaurant_id: restaurantId,
        reporter_id: user.id,
        reason: reportReason,
      });

      if (error) throw error;

      toast.success("Recensione segnalata con successo");
      setReportedReviews(prev => new Set([...prev, reportingReview]));
      setReportDialogOpen(false);
      setReportingReview(null);
      setReportReason("");
    } catch (error) {
      console.error("Error reporting review:", error);
      toast.error("Errore nella segnalazione della recensione");
    }
  };

  const getLevelBadgeColor = (level: string) => {
    switch (level) {
      case 'Platinum':
        return 'bg-gradient-to-r from-slate-300 to-slate-500 text-white';
      case 'Gold':
        return 'bg-gradient-to-r from-yellow-400 to-amber-500 text-white';
      case 'Silver':
        return 'bg-gradient-to-r from-gray-300 to-gray-400 text-gray-800';
      case 'Bronze':
      default:
        return 'bg-gradient-to-r from-amber-600 to-amber-700 text-white';
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
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <h4 className="font-semibold">{review.profiles.name}</h4>
                  <Badge className={`text-xs ${getLevelBadgeColor(review.profiles.level)}`}>
                    {review.profiles.level}
                  </Badge>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">
                    {new Date(review.created_at).toLocaleDateString('it-IT')}
                  </span>
                  {hasRole && !reportedReviews.has(review.id) && (
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive"
                      onClick={() => {
                        setReportingReview(review.id);
                        setReportDialogOpen(true);
                      }}
                      title="Segnala recensione"
                    >
                      <Flag className="h-4 w-4" />
                    </Button>
                  )}
                  {reportedReviews.has(review.id) && (
                    <Badge variant="outline" className="text-xs text-amber-600 border-amber-600">
                      <AlertTriangle className="h-3 w-3 mr-1" />
                      Segnalata
                    </Badge>
                  )}
                </div>
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

      {/* Report Dialog */}
      <Dialog open={reportDialogOpen} onOpenChange={setReportDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Flag className="h-5 w-5 text-destructive" />
              Segnala Recensione
            </DialogTitle>
            <DialogDescription>
              Seleziona il motivo della segnalazione. Il nostro team esaminerà la recensione.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Select value={reportReason} onValueChange={setReportReason}>
              <SelectTrigger>
                <SelectValue placeholder="Seleziona un motivo..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="fake">Recensione falsa o spam</SelectItem>
                <SelectItem value="offensive">Contenuto offensivo o inappropriato</SelectItem>
                <SelectItem value="irrelevant">Non pertinente al ristorante</SelectItem>
                <SelectItem value="conflict">Conflitto di interessi</SelectItem>
                <SelectItem value="privacy">Violazione della privacy</SelectItem>
                <SelectItem value="other">Altro</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setReportDialogOpen(false);
                setReportingReview(null);
                setReportReason("");
              }}
            >
              Annulla
            </Button>
            <Button
              variant="destructive"
              onClick={handleReportReview}
              disabled={!reportReason}
            >
              Invia Segnalazione
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
