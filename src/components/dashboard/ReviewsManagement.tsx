import { ReviewsList } from "@/components/ReviewsList";
import { MessageSquare, Star, TrendingUp } from "lucide-react";
import { Card } from "@/components/ui/card";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

interface ReviewsManagementProps {
  restaurantId: string;
}

interface ReviewStats {
  total: number;
  avgRating: number;
  thisMonth: number;
}

export const ReviewsManagement = ({ restaurantId }: ReviewsManagementProps) => {
  const [stats, setStats] = useState<ReviewStats>({ total: 0, avgRating: 0, thisMonth: 0 });

  useEffect(() => {
    const fetchStats = async () => {
      // Get total reviews and avg rating
      const { data: reviews } = await supabase
        .from('reviews')
        .select('rating, created_at')
        .eq('restaurant_id', restaurantId);

      if (reviews) {
        const total = reviews.length;
        const avgRating = total > 0 
          ? reviews.reduce((sum, r) => sum + r.rating, 0) / total 
          : 0;
        
        // Count reviews this month
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const thisMonth = reviews.filter(r => 
          new Date(r.created_at) >= startOfMonth
        ).length;

        setStats({ total, avgRating, thisMonth });
      }
    };
    fetchStats();
  }, [restaurantId]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <MessageSquare className="w-6 h-6 text-primary" />
          Gestione Recensioni
        </h2>
        <p className="text-muted-foreground mt-1">
          Monitora e rispondi alle recensioni dei tuoi clienti
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4 bg-gradient-to-br from-card to-muted/30 border-border/50">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-primary/10">
              <MessageSquare className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.total}</p>
              <p className="text-xs text-muted-foreground">Recensioni totali</p>
            </div>
          </div>
        </Card>
        <Card className="p-4 bg-gradient-to-br from-card to-muted/30 border-border/50">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-amber-500/10">
              <Star className="w-5 h-5 text-amber-500" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.avgRating.toFixed(1)}</p>
              <p className="text-xs text-muted-foreground">Valutazione media</p>
            </div>
          </div>
        </Card>
        <Card className="p-4 bg-gradient-to-br from-card to-muted/30 border-border/50">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-green-500/10">
              <TrendingUp className="w-5 h-5 text-green-500" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.thisMonth}</p>
              <p className="text-xs text-muted-foreground">Questo mese</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Reviews List */}
      <ReviewsList restaurantId={restaurantId} />
    </div>
  );
};