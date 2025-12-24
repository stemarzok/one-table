import { Star } from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface RatingBreakdownProps {
  rating: {
    avg_rating: number;
    total_reviews: number;
    avg_food?: number;
    avg_service?: number;
    avg_ambiance?: number;
  };
}

export const RatingBreakdown = ({ rating }: RatingBreakdownProps) => {
  if (!rating || !rating.total_reviews) return null;

  const categories = [
    { label: "Cibo", value: rating.avg_food },
    { label: "Servizio", value: rating.avg_service },
    { label: "Atmosfera", value: rating.avg_ambiance },
  ].filter(c => c.value !== null && c.value !== undefined);

  return (
    <div className="flex flex-col md:flex-row gap-6 p-6 bg-muted/30 rounded-xl">
      {/* Main Rating */}
      <div className="flex flex-col items-center justify-center min-w-[120px]">
        <span className="text-5xl font-bold text-foreground">{rating.avg_rating}</span>
        <span className="text-sm font-medium text-muted-foreground mt-1">Eccellente</span>
        <div className="flex gap-0.5 mt-2">
          {[1, 2, 3, 4, 5].map((star) => (
            <div
              key={star}
              className={`w-4 h-4 rounded-full ${
                star <= Math.round(rating.avg_rating) 
                  ? 'bg-green-500' 
                  : 'bg-muted'
              }`}
            />
          ))}
        </div>
        <span className="text-sm text-muted-foreground mt-1">
          ({rating.total_reviews})
        </span>
      </div>

      {/* Category breakdown */}
      {categories.length > 0 && (
        <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
          {categories.map((cat) => (
            <div key={cat.label} className="space-y-1.5">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">{cat.label}</span>
                <span className="font-medium">{cat.value?.toFixed(1)}</span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div 
                  className="h-full bg-green-500 rounded-full transition-all"
                  style={{ width: `${((cat.value || 0) / 5) * 100}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
