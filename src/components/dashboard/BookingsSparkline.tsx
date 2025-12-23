import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AreaChart, Area, ResponsiveContainer } from "recharts";

interface BookingsSparklineProps {
  restaurantId: string;
  status?: "pending" | "confirmed" | "all";
}

export const BookingsSparkline = ({ restaurantId, status = "all" }: BookingsSparklineProps) => {
  const [data, setData] = useState<{ day: string; count: number }[]>([]);

  useEffect(() => {
    const fetchLast7Days = async () => {
      const today = new Date();
      const days: { day: string; count: number }[] = [];

      for (let i = 6; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(today.getDate() - i);
        const dateStr = date.toISOString().split("T")[0];
        days.push({ day: dateStr, count: 0 });
      }

      let query = supabase
        .from("bookings")
        .select("booking_date, status")
        .eq("restaurant_id", restaurantId)
        .gte("booking_date", days[0].day)
        .lte("booking_date", days[6].day);

      const { data: bookings } = await query;

      if (bookings) {
        bookings.forEach((b) => {
          if (status === "all" || b.status === status) {
            const dayEntry = days.find((d) => d.day === b.booking_date);
            if (dayEntry) dayEntry.count++;
          }
        });
      }

      setData(days);
    };

    if (restaurantId) fetchLast7Days();
  }, [restaurantId, status]);

  const hasData = data.some((d) => d.count > 0);

  if (!hasData) {
    return (
      <div className="h-8 flex items-center">
        <span className="text-xs text-muted-foreground">Nessun dato</span>
      </div>
    );
  }

  return (
    <div className="h-8 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="sparklineGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.4} />
              <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0} />
            </linearGradient>
          </defs>
          <Area
            type="monotone"
            dataKey="count"
            stroke="hsl(var(--primary))"
            strokeWidth={1.5}
            fill="url(#sparklineGradient)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};
