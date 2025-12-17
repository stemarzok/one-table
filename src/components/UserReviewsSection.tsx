import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Star, Pencil, Trash2, X, Check, ExternalLink } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";

interface UserReview {
  id: string;
  rating: number;
  comment: string | null;
  created_at: string;
  is_edited: boolean;
  edited_at: string | null;
  restaurant_id: string;
  restaurant: {
    id: string;
    name: string;
  };
}

interface UserReviewsSectionProps {
  userId: string;
  onClose: () => void;
}

const UserReviewsSection = ({ userId, onClose }: UserReviewsSectionProps) => {
  const navigate = useNavigate();
  const [reviews, setReviews] = useState<UserReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editComment, setEditComment] = useState("");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [reviewToDelete, setReviewToDelete] = useState<string | null>(null);

  useEffect(() => {
    fetchReviews();
  }, [userId]);

  const fetchReviews = async () => {
    try {
      const { data, error } = await supabase
        .from("reviews")
        .select(`
          id,
          rating,
          comment,
          created_at,
          is_edited,
          edited_at,
          restaurant_id,
          restaurants:restaurant_id (id, name)
        `)
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (error) throw error;

      const formattedReviews = (data || []).map((review: any) => ({
        ...review,
        restaurant: review.restaurants,
      }));

      setReviews(formattedReviews);
    } catch (error) {
      console.error("Error fetching reviews:", error);
    } finally {
      setLoading(false);
    }
  };

  const canEdit = (createdAt: string) => {
    const created = new Date(createdAt);
    const now = new Date();
    const hoursDiff = (now.getTime() - created.getTime()) / (1000 * 60 * 60);
    return hoursDiff <= 24;
  };

  const handleStartEdit = (review: UserReview) => {
    setEditingId(review.id);
    setEditComment(review.comment || "");
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditComment("");
  };

  const handleSaveEdit = async (reviewId: string) => {
    try {
      const { error } = await supabase
        .from("reviews")
        .update({
          comment: editComment,
          is_edited: true,
          edited_at: new Date().toISOString(),
        })
        .eq("id", reviewId)
        .eq("user_id", userId);

      if (error) throw error;

      toast.success("Recensione modificata");
      setEditingId(null);
      setEditComment("");
      fetchReviews();
    } catch (error) {
      console.error("Error updating review:", error);
      toast.error("Errore nella modifica della recensione");
    }
  };

  const handleDeleteClick = (reviewId: string) => {
    setReviewToDelete(reviewId);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!reviewToDelete) return;

    try {
      const { error } = await supabase
        .from("reviews")
        .delete()
        .eq("id", reviewToDelete)
        .eq("user_id", userId);

      if (error) throw error;

      toast.success("Recensione eliminata");
      setDeleteDialogOpen(false);
      setReviewToDelete(null);
      fetchReviews();
    } catch (error) {
      console.error("Error deleting review:", error);
      toast.error("Errore nell'eliminazione della recensione");
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
        <Card className="w-full max-w-2xl max-h-[80vh] overflow-y-auto m-4 p-6">
          <div className="text-center py-8">Caricamento...</div>
        </Card>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
      <Card className="w-full max-w-2xl max-h-[80vh] overflow-y-auto m-4">
        <div className="sticky top-0 bg-card border-b p-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold">Le Mie Recensioni</h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        <div className="p-4 space-y-4">
          {reviews.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Non hai ancora scritto recensioni
            </div>
          ) : (
            reviews.map((review) => (
              <Card key={review.id} className="p-4 space-y-3">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <button
                      onClick={() => navigate(`/restaurants/${review.restaurant_id}`)}
                      className="font-semibold text-primary hover:underline flex items-center gap-1"
                    >
                      {review.restaurant?.name || "Ristorante"}
                      <ExternalLink className="h-3 w-3" />
                    </button>
                    <div className="flex items-center gap-2">
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
                      <span className="text-sm text-muted-foreground">
                        {new Date(review.created_at).toLocaleDateString("it-IT")}
                      </span>
                      {review.is_edited && (
                        <Badge variant="secondary" className="text-xs">
                          modificata
                        </Badge>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {canEdit(review.created_at) && editingId !== review.id && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => handleStartEdit(review)}
                        title="Modifica (disponibile entro 24h)"
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive hover:text-destructive"
                      onClick={() => handleDeleteClick(review.id)}
                      title="Elimina"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {editingId === review.id ? (
                  <div className="space-y-2">
                    <Textarea
                      value={editComment}
                      onChange={(e) => setEditComment(e.target.value)}
                      placeholder="Scrivi la tua recensione..."
                      rows={3}
                    />
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => handleSaveEdit(review.id)}
                      >
                        <Check className="h-4 w-4 mr-1" />
                        Salva
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={handleCancelEdit}
                      >
                        Annulla
                      </Button>
                    </div>
                  </div>
                ) : (
                  review.comment && (
                    <p className="text-muted-foreground">{review.comment}</p>
                  )
                )}

                {!canEdit(review.created_at) && editingId !== review.id && (
                  <p className="text-xs text-muted-foreground italic">
                    La modifica è disponibile solo entro 24h dalla pubblicazione
                  </p>
                )}
              </Card>
            ))
          )}
        </div>
      </Card>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Elimina Recensione</AlertDialogTitle>
            <AlertDialogDescription>
              Sei sicuro di voler eliminare questa recensione? L'azione non può essere annullata.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annulla</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Elimina
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default UserReviewsSection;
