import { useState, useEffect } from "react";
import { ChevronDown, ChevronUp, TrendingUp, TrendingDown, History } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { it } from "date-fns/locale";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Button } from "@/components/ui/button";

interface PointsHistoryItem {
  id: string;
  points_change: number;
  reason: string;
  restaurant_name: string | null;
  created_at: string;
}

interface PointsHistorySectionProps {
  userId: string;
}

const PointsHistorySection = ({ userId }: PointsHistorySectionProps) => {
  const [history, setHistory] = useState<PointsHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const fetchHistory = async () => {
      const { data, error } = await supabase
        .from('points_history')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(50);

      if (!error && data) {
        setHistory(data);
      }
      setLoading(false);
    };

    if (userId) {
      fetchHistory();
    }
  }, [userId]);

  const lastChange = history[0];

  return (
    <div className="space-y-3">
      {/* Last change indicator */}
      {lastChange && (
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Ultimo cambio:</span>
          <div className={`flex items-center gap-1 font-semibold ${
            lastChange.points_change > 0 ? 'text-green-500' : 'text-red-500'
          }`}>
            {lastChange.points_change > 0 ? (
              <TrendingUp className="w-4 h-4" />
            ) : (
              <TrendingDown className="w-4 h-4" />
            )}
            <span>
              {lastChange.points_change > 0 ? '+' : ''}{lastChange.points_change} punti
            </span>
          </div>
        </div>
      )}

      {/* Expandable history */}
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger asChild>
          <Button variant="ghost" size="sm" className="w-full justify-between">
            <span className="flex items-center gap-2">
              <History className="w-4 h-4" />
              Storico Punti
            </span>
            {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent className="mt-2">
          {loading ? (
            <p className="text-sm text-muted-foreground text-center py-4">Caricamento...</p>
          ) : history.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              Nessuno storico disponibile. I punti verranno registrati quando completerai prenotazioni.
            </p>
          ) : (
            <div className="space-y-2 max-h-60 overflow-y-auto rounded-lg border bg-muted/30 p-3">
              {history.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between py-2 border-b border-border/50 last:border-0"
                >
                  <div className="flex-1">
                    <p className="text-sm font-medium">{item.reason}</p>
                    {item.restaurant_name && (
                      <p className="text-xs text-muted-foreground">{item.restaurant_name}</p>
                    )}
                    <p className="text-xs text-muted-foreground">
                      {format(new Date(item.created_at), "d MMM yyyy 'alle' HH:mm", { locale: it })}
                    </p>
                  </div>
                  <div className={`font-bold ${
                    item.points_change > 0 ? 'text-green-500' : 'text-red-500'
                  }`}>
                    {item.points_change > 0 ? '+' : ''}{item.points_change}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
};

export default PointsHistorySection;